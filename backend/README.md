# StreamSwarm Backend API

Simple Python Flask API for video upload, splitting, and chunk serving.

## Setup

### 1. Install MongoDB
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Install FFmpeg
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### 4. Configure Environment
```bash
# Option 1: Use the setup script
python setup_env.py

# Option 2: Manually create .env file
# Copy the template below and save as .env
# Edit .env with your settings
```

Create a `.env` file with the following content:
```env
# MongoDB Configuration
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
```

### 5. Run the API
```bash
python run.py
```

Server will start on http://localhost:8080

## API Endpoints

### Authentication

#### Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "message": "User created successfully",
  "user_id": "uuid"
}
```

#### Sign In
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "message": "Sign in successful",
  "user_id": "uuid",
  "username": "johndoe",
  "email": "john@example.com"
}
```

#### Sign Out
```bash
POST /api/auth/signout

Response:
{
  "message": "Signed out successfully"
}
```

### Video Management

#### Upload Video
```bash
POST /api/upload
Content-Type: multipart/form-data

curl -X POST http://localhost:8080/api/upload \
  -F "video=@/path/to/video.mp4"

Response:
{
  "video_id": "uuid-here",
  "message": "Video uploaded and processing started",
  "status": "processing"
}
```

#### Get All Videos
```bash
GET /api/videos

Response:
{
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
```

#### Get Video Details
```bash
GET /api/video/{video_id}
```

#### Get Manifest
```bash
GET /api/manifest/{video_id}

Response:
{
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
```

#### Get Chunk
```bash
GET /api/chunks/{video_id}/chunk_000.mp4

Returns: Binary MP4 file
```

#### Check Status
```bash
GET /api/status/{video_id}

Response:
{
  "video_id": "uuid",
  "status": "ready",
  "total_chunks": 150
}
```

## Frontend Integration

Update frontend config:
```javascript
// frontend/src/config.js
const CONFIG = {
  API_URL: 'http://localhost:8080/api',
  CDN_URL: 'http://localhost:8080/api/chunks',
};
```

## MongoDB Collections

### users
```javascript
{
  _id: ObjectId("..."),
  username: "johndoe",
  email: "john@example.com",
  password_hash: "bcrypt_hash...",
  created_at: ISODate("2024-01-01T00:00:00Z"),
  updated_at: ISODate("2024-01-01T00:00:00Z")
}
```

### videos
```javascript
{
  _id: ObjectId("..."),
  video_id: "uuid",
  filename: "uuid.mp4",
  original_name: "video.mp4",
  status: "ready",  // uploaded, processing, ready, failed
  total_chunks: 150,
  user_id: "user_id_optional",
  created_at: ISODate("2024-01-01T00:00:00Z"),
  updated_at: ISODate("2024-01-01T00:05:00Z")
}
```

### chunks
```javascript
{
  _id: ObjectId("..."),
  video_id: "uuid",
  chunk_id: 0,
  filename: "chunk_000.mp4",
  hash: "sha256...",
  size: 1024000,
  url: "/api/chunks/{video_id}/chunk_000.mp4",
  created_at: ISODate("2024-01-01T00:05:00Z")
}
```

## Testing
```bash
# Sign up
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Sign in
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Upload a video
curl -X POST http://localhost:8080/api/upload \
  -F "video=@test_video.mp4"

# Check status
curl http://localhost:8080/api/status/{video_id}

# Get manifest
curl http://localhost:8080/api/manifest/{video_id}

# Download a chunk
curl http://localhost:8080/api/chunks/{video_id}/chunk_000.mp4 \
  -o chunk_000.mp4
```

## Architecture

```
┌──────────────┐
│   Frontend   │ (React - Port 5173)
│  (Lovable)   │
└──────┬───────┘
       │
       ├─── HTTP ────▶ Python API (Port 8080)
       │                   ├─── Triggers ────▶ split.py
       │                   ├─── Stores  ────▶ MongoDB
       │                   └─── Serves  ────▶ Chunks
       │
       └─── WebSocket ──▶ Tracker Server (Port 9000)
                              (Built separately)
```

## Notes

- This API does NOT include the Tracker server (WebSocket)
- Tracker server should be built separately
- This API only handles:
  - User authentication (sign up/sign in/sign out)
  - Video upload
  - Video splitting (using existing Python scripts)
  - Chunk storage and serving
  - MongoDB metadata storage

