import os
import sys
import json
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import threading

# Add parent directory to import splitting modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import AFTER adding to path
try:
    from splitting import split
except ImportError:
    print("Warning: Could not import splitting module")

from .database import db
from .utils import generate_video_id, generate_manifest, ensure_directories

video_bp = Blueprint('video', __name__, url_prefix='/api')

VIDEOS_DIR = os.getenv('VIDEOS_DIR', 'storage/videos')
CHUNKS_DIR = os.getenv('CHUNKS_DIR', 'storage/chunks')
ALLOWED_EXTENSIONS = {'.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv'}

ensure_directories()

def process_video_async(video_id, video_path, original_filename, user_id=None):
    """Background task: split video and align output directory to video_id"""
    import shutil

    try:
        print(f"🎬 Starting processing for {video_id}")
        db.update_video_status(video_id, 'processing')

        # ── STEP 1: Run splitting ──────────────────────────────────
        # Read split.py to confirm its exact function signature.
        # split_video() outputs chunks into:
        #   CHUNKS_DIR/<original_video_name_without_ext>/
        # We need them in:
        #   CHUNKS_DIR/<video_id>/

        # Derive what split.py will name its output folder
        original_name_no_ext = os.path.splitext(
            os.path.basename(video_path)
        )[0]  # e.g. "abc123def456" (the uuid filename we saved)

        split.split_video(
            input_video=video_path,
            base_output_dir=CHUNKS_DIR,
            chunk_duration=5
        )

        # ── STEP 2: Rename output folder to video_id ──────────────
        split_output_dir = os.path.join(CHUNKS_DIR, original_name_no_ext)
        target_dir = os.path.join(CHUNKS_DIR, video_id)

        if os.path.exists(split_output_dir) and split_output_dir != target_dir:
            shutil.move(split_output_dir, target_dir)
            print(f"📁 Renamed chunk dir: {original_name_no_ext} → {video_id}")
        elif not os.path.exists(target_dir):
            raise FileNotFoundError(
                f"Split output not found at {split_output_dir} or {target_dir}"
            )

        print(f"✅ Splitting complete for {video_id}")

        # ── STEP 3: Generate manifest ──────────────────────────────
        manifest = generate_manifest(video_id, CHUNKS_DIR)
        db.save_chunks(video_id, manifest['chunks'])

        db.update_video_status(
            video_id,
            'ready',
            total_chunks=manifest['total_chunks'],
            manifest_url=f'/api/manifest/{video_id}'
        )

        print(f"✅ Processing complete for {video_id} — {manifest['total_chunks']} chunks")

    except Exception as e:
        print(f"❌ Processing failed for {video_id}: {str(e)}")
        db.update_video_status(video_id, 'failed', error=str(e))

@video_bp.route('/upload', methods=['POST'])
def upload_video():
    """Upload a video file"""
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            return jsonify({'error': f'Invalid file type. Allowed: {list(ALLOWED_EXTENSIONS)}'}), 400
        
        # Generate unique video ID
        video_id = generate_video_id()
        filename = secure_filename(file.filename)
        
        # Save file
        video_path = os.path.join(VIDEOS_DIR, f"{video_id}{file_ext}")
        file.save(video_path)
        
        # Get user_id if authenticated
        user_id = None
        if hasattr(request, 'user'):
            user_id = request.user.get('user_id')
        
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
            args=(video_id, video_path, filename, user_id)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'video_id': video_id,
            'message': 'Video uploaded and processing started',
            'status': 'processing'
        }), 202
    
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@video_bp.route('/videos', methods=['GET'])
def get_videos():
    """Get all videos"""
    try:
        videos = db.get_all_videos()
        
        # Convert ObjectId to string and datetime to ISO format
        for video in videos:
            video['_id'] = str(video['_id'])
            if 'created_at' in video and video['created_at']:
                video['created_at'] = video['created_at'].isoformat()
            if 'updated_at' in video and video['updated_at']:
                video['updated_at'] = video['updated_at'].isoformat()
        
        return jsonify({'videos': videos}), 200
    
    except Exception as e:
        print(f"Get videos error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@video_bp.route('/video/<video_id>', methods=['GET'])
def get_video(video_id):
    """Get video details"""
    try:
        video = db.get_video(video_id)
        
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        video['_id'] = str(video['_id'])
        if 'created_at' in video and video['created_at']:
            video['created_at'] = video['created_at'].isoformat()
        if 'updated_at' in video and video['updated_at']:
            video['updated_at'] = video['updated_at'].isoformat()
        
        return jsonify(video), 200
    
    except Exception as e:
        print(f"Get video error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@video_bp.route('/manifest/<video_id>', methods=['GET'])
def get_manifest(video_id):
    """Get video manifest"""
    try:
        video = db.get_video(video_id)
        
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        if video['status'] != 'ready':
            return jsonify({'error': f"Video not ready. Status: {video['status']}"}), 400
        
        # Read manifest file
        manifest_path = os.path.join(CHUNKS_DIR, video_id, 'manifest.json')
        
        if not os.path.exists(manifest_path):
            return jsonify({'error': 'Manifest not found'}), 404
        
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        return jsonify(manifest), 200
    
    except Exception as e:
        print(f"Get manifest error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@video_bp.route('/chunks/<video_id>/<chunk_filename>', methods=['GET'])
def serve_chunk(video_id, chunk_filename):
    """Serve a specific video chunk"""
    try:
        chunk_path = os.path.join(CHUNKS_DIR, video_id, chunk_filename)
        
        if not os.path.exists(chunk_path):
            return jsonify({'error': 'Chunk not found'}), 404
        
        return send_file(
            chunk_path,
            mimetype='video/mp4',
            as_attachment=False,
            download_name=chunk_filename
        )
    
    except Exception as e:
        print(f"Serve chunk error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@video_bp.route('/status/<video_id>', methods=['GET'])
def get_status(video_id):
    """Get video processing status"""
    try:
        video = db.get_video(video_id)
        
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        return jsonify({
            'video_id': video_id,
            'status': video['status'],
            'total_chunks': video.get('total_chunks', 0)
        }), 200
    
    except Exception as e:
        print(f"Get status error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
