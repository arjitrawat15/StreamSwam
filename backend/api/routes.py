import os
import sys
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import threading
import bcrypt
from functools import wraps

# Add parent directory to path to import splitting modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from splitting import split

from .database import db
from .utils import (
    generate_video_id, 
    generate_manifest,
    ensure_directories
)

api = Blueprint('api', __name__)

VIDEOS_DIR = os.getenv('VIDEOS_DIR', 'storage/videos')
CHUNKS_DIR = os.getenv('CHUNKS_DIR', 'storage/chunks')

# Ensure directories exist
ensure_directories()

# Authentication helper
def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, password_hash):
    """Verify a password against a hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def get_current_user():
    """Get current user from session (simple implementation)"""
    # In a production app, you'd use JWT tokens or session management
    # For now, we'll use a simple header-based approach
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return db.get_user_by_id(user_id)
    return None

def process_video_async(video_id, video_path, original_filename):
    """Background task to process video"""
    try:
        print(f"🎬 Starting processing for {video_id}")
        
        # Update status to processing
        db.update_video_status(video_id, 'processing')
        
        # Call the splitting function
        # split.split_video expects: input_video, base_output_dir, chunk_duration
        # Note: split_video creates a subdirectory named after the video (without extension)
        # Since we save videos as {video_id}.mp4, the directory will be named {video_id}
        split.split_video(
            input_video=video_path,
            base_output_dir=CHUNKS_DIR,
            chunk_duration=5
        )
        
        print(f"✅ Splitting complete for {video_id}")
        
        # Generate manifest
        manifest = generate_manifest(video_id, CHUNKS_DIR)
        
        # Save chunk info to database
        chunks_data = manifest['chunks']
        db.save_chunks(video_id, chunks_data)
        
        # Update video status
        db.update_video_status(
            video_id, 
            'ready',
            total_chunks=manifest['total_chunks'],
            manifest_url=f'/api/manifest/{video_id}'
        )
        
        print(f"✅ Processing complete for {video_id}")
        
    except Exception as e:
        print(f"❌ Processing failed for {video_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        db.update_video_status(video_id, 'failed', error=str(e))


# Authentication routes
@api.route('/auth/signup', methods=['POST'])
def signup():
    """
    Create a new user account
    
    Request: {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    Response: {
        "message": "User created successfully",
        "user_id": "string"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields: username, email, password'}), 400
    
    # Check if user already exists
    if db.get_user_by_email(email):
        return jsonify({'error': 'Email already registered'}), 400
    
    if db.get_user_by_username(username):
        return jsonify({'error': 'Username already taken'}), 400
    
    # Hash password
    password_hash = hash_password(password)
    
    # Create user
    result = db.create_user({
        'username': username,
        'email': email,
        'password_hash': password_hash
    })
    
    return jsonify({
        'message': 'User created successfully',
        'user_id': str(result.inserted_id)
    }), 201


@api.route('/auth/signin', methods=['POST'])
def signin():
    """
    Sign in a user
    
    Request: {
        "email": "string",
        "password": "string"
    }
    Response: {
        "message": "Sign in successful",
        "user_id": "string",
        "username": "string"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Get user by email
    user = db.get_user_by_email(email)
    
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Verify password
    if not verify_password(password, user['password_hash']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    return jsonify({
        'message': 'Sign in successful',
        'user_id': str(user['_id']),
        'username': user['username'],
        'email': user['email']
    }), 200


@api.route('/auth/signout', methods=['POST'])
def signout():
    """
    Sign out a user (client-side session cleanup)
    
    Response: {
        "message": "Signed out successfully"
    }
    """
    # In a stateless API, signout is mainly client-side
    # You might want to invalidate tokens here if using JWT
    return jsonify({
        'message': 'Signed out successfully'
    }), 200


# Video routes
@api.route('/upload', methods=['POST'])
def upload_video():
    """
    Upload a video file
    
    Request: multipart/form-data with 'video' file
    Response: {
        "video_id": "uuid",
        "message": "Video uploaded successfully",
        "status": "processing"
    }
    """
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    file = request.files['video']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Validate file extension
    allowed_extensions = {'.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        return jsonify({'error': f'Invalid file type. Allowed: {allowed_extensions}'}), 400
    
    # Get current user (optional)
    user = get_current_user()
    user_id = str(user['_id']) if user else None
    
    # Generate unique video ID
    video_id = generate_video_id()
    filename = secure_filename(file.filename)
    
    # Save file
    video_path = os.path.join(VIDEOS_DIR, f"{video_id}{file_ext}")
    file.save(video_path)
    
    # Save to database
    db.save_video({
        'video_id': video_id,
        'filename': f"{video_id}{file_ext}",
        'original_name': filename,
        'status': 'uploaded',
        'total_chunks': 0,
        'user_id': user_id
    })
    
    # Start processing in background thread
    thread = threading.Thread(
        target=process_video_async,
        args=(video_id, video_path, filename)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'video_id': video_id,
        'message': 'Video uploaded and processing started',
        'status': 'processing'
    }), 202


@api.route('/videos', methods=['GET'])
def get_videos():
    """
    Get all videos
    
    Response: {
        "videos": [
            {
                "video_id": "uuid",
                "original_name": "video.mp4",
                "status": "ready",
                "total_chunks": 150,
                "created_at": "2024-01-01T00:00:00"
            }
        ]
    }
    """
    videos = db.get_all_videos()
    
    # Convert ObjectId to string for JSON serialization
    for video in videos:
        video['_id'] = str(video['_id'])
        # Convert datetime to ISO format
        if 'created_at' in video and video['created_at']:
            video['created_at'] = video['created_at'].isoformat()
        if 'updated_at' in video and video['updated_at']:
            video['updated_at'] = video['updated_at'].isoformat()
    
    return jsonify({'videos': videos})


@api.route('/video/<video_id>', methods=['GET'])
def get_video(video_id):
    """
    Get video details
    
    Response: {
        "video_id": "uuid",
        "status": "ready",
        "total_chunks": 150,
        "manifest_url": "/api/manifest/{video_id}"
    }
    """
    video = db.get_video(video_id)
    
    if not video:
        return jsonify({'error': 'Video not found'}), 404
    
    video['_id'] = str(video['_id'])
    # Convert datetime to ISO format
    if 'created_at' in video and video['created_at']:
        video['created_at'] = video['created_at'].isoformat()
    if 'updated_at' in video and video['updated_at']:
        video['updated_at'] = video['updated_at'].isoformat()
    
    return jsonify(video)


@api.route('/manifest/<video_id>', methods=['GET'])
def get_manifest(video_id):
    """
    Get video manifest (list of all chunks with hashes)
    
    Response: {
        "video_id": "uuid",
        "total_chunks": 150,
        "chunk_duration": 5,
        "chunks": [
            {
                "id": 0,
                "filename": "chunk_000.mp4",
                "hash": "sha256...",
                "size": 1024000,
                "url": "/api/chunks/{video_id}/chunk_000.mp4"
            }
        ]
    }
    """
    video = db.get_video(video_id)
    
    if not video:
        return jsonify({'error': 'Video not found'}), 404
    
    if video['status'] != 'ready':
        return jsonify({'error': f"Video not ready. Status: {video['status']}"}), 400
    
    # Read manifest file
    manifest_path = os.path.join(CHUNKS_DIR, video_id, 'manifest.json')
    
    if not os.path.exists(manifest_path):
        return jsonify({'error': 'Manifest not found'}), 404
    
    import json
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    return jsonify(manifest)


@api.route('/chunks/<video_id>/<chunk_filename>', methods=['GET'])
def serve_chunk(video_id, chunk_filename):
    """
    Serve a specific video chunk
    
    URL: /api/chunks/{video_id}/chunk_000.mp4
    Response: Binary MP4 file
    """
    chunk_path = os.path.join(CHUNKS_DIR, video_id, chunk_filename)
    
    if not os.path.exists(chunk_path):
        return jsonify({'error': 'Chunk not found'}), 404
    
    return send_file(
        chunk_path,
        mimetype='video/mp4',
        as_attachment=False,
        download_name=chunk_filename
    )


@api.route('/status/<video_id>', methods=['GET'])
def get_status(video_id):
    """
    Get video processing status
    
    Response: {
        "video_id": "uuid",
        "status": "processing|ready|failed",
        "total_chunks": 0-150
    }
    """
    video = db.get_video(video_id)
    
    if not video:
        return jsonify({'error': 'Video not found'}), 404
    
    # Convert datetime to ISO format
    if 'created_at' in video and video['created_at']:
        video['created_at'] = video['created_at'].isoformat()
    if 'updated_at' in video and video['updated_at']:
        video['updated_at'] = video['updated_at'].isoformat()
    
    return jsonify({
        'video_id': video_id,
        'status': video['status'],
        'total_chunks': video.get('total_chunks', 0)
    })

