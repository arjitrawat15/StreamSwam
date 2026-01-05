"""
Helper script to create .env file from .env.example
Run this if .env.example exists and you need to create .env
"""
import os
import shutil

if __name__ == '__main__':
    env_example = '.env.example'
    env_file = '.env'
    
    if os.path.exists(env_example):
        if not os.path.exists(env_file):
            shutil.copy(env_example, env_file)
            print(f"✅ Created {env_file} from {env_example}")
            print("⚠️  Please edit .env and update the configuration values")
        else:
            print(f"⚠️  {env_file} already exists. Skipping.")
    else:
        print(f"❌ {env_example} not found. Creating default .env file...")
        with open(env_file, 'w') as f:
            f.write("""# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=streamswarm

# Storage Paths
VIDEOS_DIR=storage/videos
CHUNKS_DIR=storage/chunks
MANIFESTS_DIR=storage/manifests

# Server Configuration
FLASK_PORT=8080
FLASK_HOST=0.0.0.0
FLASK_DEBUG=True

# CORS (Frontend URL)
FRONTEND_URL=http://localhost:5173

# JWT Secret (for authentication)
JWT_SECRET_KEY=your-secret-key-change-this-in-production
""")
        print(f"✅ Created default {env_file}")

