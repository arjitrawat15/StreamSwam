"""
Data models for StreamSwarm API
"""
from datetime import datetime
from typing import Optional

class Video:
    """Video model"""
    def __init__(self, video_id: str, filename: str, original_name: str, 
                 status: str = 'uploaded', total_chunks: int = 0, 
                 user_id: Optional[str] = None):
        self.video_id = video_id
        self.filename = filename
        self.original_name = original_name
        self.status = status  # uploaded, processing, ready, failed
        self.total_chunks = total_chunks
        self.user_id = user_id
        self.created_at = datetime.utcnow()
        self.updated_at = None
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'video_id': self.video_id,
            'filename': self.filename,
            'original_name': self.original_name,
            'status': self.status,
            'total_chunks': self.total_chunks,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Chunk:
    """Video chunk model"""
    def __init__(self, video_id: str, chunk_id: int, filename: str, 
                 hash: str, size: int, url: str):
        self.video_id = video_id
        self.chunk_id = chunk_id
        self.filename = filename
        self.hash = hash
        self.size = size
        self.url = url
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'video_id': self.video_id,
            'chunk_id': self.chunk_id,
            'filename': self.filename,
            'hash': self.hash,
            'size': self.size,
            'url': self.url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class User:
    """User model"""
    def __init__(self, username: str, email: str, password_hash: str):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self, include_password=False):
        """Convert to dictionary"""
        data = {
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_password:
            data['password_hash'] = self.password_hash
        return data

