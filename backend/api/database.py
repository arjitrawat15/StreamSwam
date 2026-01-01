import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
        self.db = self.client[os.getenv('MONGODB_DB', 'streamswarm')]
        
        # Collections
        self.videos = self.db.videos
        self.chunks = self.db.chunks
        self.users = self.db.users
        
        # Create indexes
        self.videos.create_index('video_id', unique=True)
        self.chunks.create_index([('video_id', 1), ('chunk_id', 1)])
        self.users.create_index('email', unique=True)
        self.users.create_index('username', unique=True)
        
    def save_video(self, video_data):
        """
        Save video metadata to database
        
        Args:
            video_data (dict): {
                'video_id': str,
                'filename': str,
                'original_name': str,
                'total_chunks': int,
                'status': str,  # 'processing', 'ready', 'failed'
                'created_at': datetime
            }
        """
        video_data['created_at'] = datetime.utcnow()
        return self.videos.insert_one(video_data)
    
    def update_video_status(self, video_id, status, **kwargs):
        """Update video processing status"""
        update_data = {'status': status, 'updated_at': datetime.utcnow()}
        update_data.update(kwargs)
        return self.videos.update_one(
            {'video_id': video_id},
            {'$set': update_data}
        )
    
    def get_video(self, video_id):
        """Get video by ID"""
        return self.videos.find_one({'video_id': video_id})
    
    def get_all_videos(self):
        """Get all videos"""
        return list(self.videos.find().sort('created_at', -1))
    
    def save_chunks(self, video_id, chunks_data):
        """
        Save chunk metadata
        
        Args:
            video_id (str): Video ID
            chunks_data (list): List of chunk info dicts
        """
        for chunk in chunks_data:
            chunk['video_id'] = video_id
            chunk['created_at'] = datetime.utcnow()
        return self.chunks.insert_many(chunks_data)
    
    def get_chunks(self, video_id):
        """Get all chunks for a video"""
        return list(self.chunks.find({'video_id': video_id}).sort('chunk_id', 1))
    
    # User authentication methods
    def create_user(self, user_data):
        """Create a new user"""
        user_data['created_at'] = datetime.utcnow()
        user_data['updated_at'] = datetime.utcnow()
        return self.users.insert_one(user_data)
    
    def get_user_by_email(self, email):
        """Get user by email"""
        return self.users.find_one({'email': email})
    
    def get_user_by_username(self, username):
        """Get user by username"""
        return self.users.find_one({'username': username})
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        return self.users.find_one({'_id': user_id})
    
    def update_user(self, user_id, update_data):
        """Update user information"""
        update_data['updated_at'] = datetime.utcnow()
        return self.users.update_one(
            {'_id': user_id},
            {'$set': update_data}
        )
    
    def close(self):
        """Close database connection"""
        self.client.close()

# Global database instance
db = MongoDB()

