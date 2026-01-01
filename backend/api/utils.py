import os
import json
import hashlib
import uuid
from pathlib import Path

def generate_video_id():
    """Generate unique video ID"""
    return str(uuid.uuid4())

def calculate_file_hash(filepath):
    """Calculate SHA-256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def get_video_name(filename):
    """Extract video name without extension"""
    return os.path.splitext(filename)[0]

def generate_manifest(video_id, chunks_dir):
    """
    Generate manifest.json for a processed video
    
    Returns:
        dict: Manifest data
    """
    video_chunks_dir = os.path.join(chunks_dir, video_id)
    
    if not os.path.exists(video_chunks_dir):
        raise FileNotFoundError(f"Chunks directory not found: {video_chunks_dir}")
    
    # Find all chunk files
    chunk_files = sorted([
        f for f in os.listdir(video_chunks_dir) 
        if f.startswith('chunk_') and f.endswith('.mp4')
    ])
    
    if not chunk_files:
        raise ValueError(f"No chunks found in {video_chunks_dir}")
    
    # Generate manifest
    manifest = {
        'video_id': video_id,
        'total_chunks': len(chunk_files),
        'chunk_duration': 5,  # Default from split.py
        'chunks': []
    }
    
    for idx, filename in enumerate(chunk_files):
        filepath = os.path.join(video_chunks_dir, filename)
        file_size = os.path.getsize(filepath)
        file_hash = calculate_file_hash(filepath)
        
        manifest['chunks'].append({
            'id': idx,
            'filename': filename,
            'hash': file_hash,
            'size': file_size,
            'url': f'/api/chunks/{video_id}/{filename}'
        })
    
    # Save manifest to file
    manifest_path = os.path.join(video_chunks_dir, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    return manifest

def ensure_directories():
    """Create necessary directories if they don't exist"""
    dirs = [
        os.getenv('VIDEOS_DIR', 'storage/videos'),
        os.getenv('CHUNKS_DIR', 'storage/chunks'),
        os.getenv('MANIFESTS_DIR', 'storage/manifests')
    ]
    for directory in dirs:
        Path(directory).mkdir(parents=True, exist_ok=True)

