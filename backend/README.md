# StreamSwarm Backend API

Production-ready Python Flask API for the StreamSwarm P2P video streaming platform.

## 🏗️ Architecture

```
backend/
├── api/
│   ├── __init__.py          # Package init
│   ├── app.py               # Flask app factory
│   ├── routes.py            # Route registry
│   ├── auth_routes.py       # Authentication endpoints
│   ├── video_routes.py      # Video management endpoints
│   ├── database.py          # MongoDB connection & operations
│   ├── models.py            # Data models
│   ├── auth.py              # Authentication logic (JWT + bcrypt)
│   └── utils.py             # Helper functions
│
├── splitting/               # Video splitting module (ffmpeg)
│   ├── __init__.py
│   ├── split.py             # Core splitting function
│   ├── main_split.py        # Batch processing
│   ├── watcher.py           # File watcher
│   └── readme.md
│
├── storage/
│   ├── videos/              # Uploaded original videos
│   └── chunks/              # Split video chunks
│
├── requirements.txt         # Python dependencies
├── .env.example             # Environment config template
├── .env                     # Environment config (generated)
├── setup_env.py             # Environment setup script
├── run.py                   # Entry point
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- MongoDB (local or Docker)
- ffmpeg (for video splitting)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Environment
```bash
python setup_env.py
```
This creates a `.env` file with a secure JWT secret key.

### 3. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Or use a local MongoDB installation
```

### 4. Run the Server
```bash
python run.py
```
Server starts at `http://localhost:8080`

## 📡 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API info |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/signout` | Sign out |
| GET | `/api/auth/me` | Get current user |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload video |
| GET | `/api/videos` | List all videos |
| GET | `/api/video/:id` | Get video details |
| GET | `/api/manifest/:id` | Get video manifest |
| GET | `/api/chunks/:id/:file` | Serve video chunk |
| GET | `/api/status/:id` | Get processing status |

## 🔐 Authentication

- Passwords hashed with **bcrypt**
- JWT tokens stored in HTTP-only cookies
- Tokens expire after 7 days
- Use `Authorization: Bearer <token>` header or cookie

## 🎬 Video Processing Pipeline

1. **Upload** → Video saved to `storage/videos/`
2. **Processing** → ffmpeg splits video into 5-second chunks
3. **Manifest** → Manifest JSON generated with chunk metadata
4. **Ready** → Chunks served via API for P2P streaming

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/` | MongoDB connection string |
| `MONGODB_DB` | `streamswarm` | Database name |
| `VIDEOS_DIR` | `storage/videos` | Video upload directory |
| `CHUNKS_DIR` | `storage/chunks` | Chunk storage directory |
| `FLASK_PORT` | `8080` | Server port |
| `FLASK_HOST` | `0.0.0.0` | Server host |
| `FLASK_DEBUG` | `True` | Debug mode |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for CORS |
| `JWT_SECRET_KEY` | (generated) | JWT signing secret |

## 🧪 Testing

```bash
# Health check
curl http://localhost:8080/health

# Signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'

# Signin
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Upload video
curl -X POST http://localhost:8080/api/upload \
  -F "video=@sample.mp4"

# List videos
curl http://localhost:8080/api/videos
```
