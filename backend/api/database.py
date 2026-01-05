import os
import sqlite3
import json
from datetime import datetime
from dotenv import load_dotenv
import uuid

load_dotenv()

class Database:
    def __init__(self):
        self.db_path = os.getenv('SQLITE_DB_PATH', 'streamswarm.db')
        self._init_db()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        conn = self._get_conn()
        c = conn.cursor()
        
        # Videos table
        c.execute('''CREATE TABLE IF NOT EXISTS videos (
            video_id TEXT PRIMARY KEY,
            filename TEXT,
            original_name TEXT,
            total_chunks INTEGER DEFAULT 0,
            status TEXT,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )''')
        
        # Chunks table
        c.execute('''CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT,
            chunk_id INTEGER,
            filename TEXT,
            hash TEXT,
            size INTEGER,
            created_at TIMESTAMP,
            FOREIGN KEY (video_id) REFERENCES videos (video_id)
        )''')
        
        # Users table
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            _id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password_hash TEXT,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )''')
        
        conn.commit()
        conn.close()

    def save_video(self, video_data):
        conn = self._get_conn()
        cur = conn.cursor()
        now = datetime.utcnow()
        video_data['created_at'] = now
        video_data['updated_at'] = now
        
        cur.execute('''INSERT INTO videos 
            (video_id, filename, original_name, total_chunks, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)''', 
            (video_data['video_id'], video_data['filename'], video_data['original_name'], 
             video_data.get('total_chunks', 0), video_data['status'], now, now))
        
        conn.commit()
        conn.close()
        return True
    
    def update_video_status(self, video_id, status, **kwargs):
        conn = self._get_conn()
        cur = conn.cursor()
        now = datetime.utcnow()
        
        update_fields = ['status = ?', 'updated_at = ?']
        params = [status, now]
        
        for k, v in kwargs.items():
            if k == 'total_chunks':
                update_fields.append(f'{k} = ?')
                params.append(v)
            # Add other fields as needed, ignore unknown
            
        params.append(video_id)
        
        query = f"UPDATE videos SET {', '.join(update_fields)} WHERE video_id = ?"
        cur.execute(query, params)
        conn.commit()
        conn.close()
    
    def get_video(self, video_id):
        conn = self._get_conn()
        cur = conn.cursor()
        cur.execute('SELECT * FROM videos WHERE video_id = ?', (video_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None
    
    def get_all_videos(self):
        conn = self._get_conn()
        cur = conn.cursor()
        cur.execute('SELECT * FROM videos ORDER BY created_at DESC')
        rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    
    def save_chunks(self, video_id, chunks_data):
        conn = self._get_conn()
        cur = conn.cursor()
        now = datetime.utcnow()
        
        data = []
        for chunk in chunks_data:
            data.append((
                video_id, 
                chunk.get('id', 0), # chunk_id
                chunk.get('filename', ''), 
                chunk.get('hash', ''), 
                chunk.get('size', 0), 
                now
            ))
            
        cur.executemany('''INSERT INTO chunks 
            (video_id, chunk_id, filename, hash, size, created_at)
            VALUES (?, ?, ?, ?, ?, ?)''', data)
            
        conn.commit()
        conn.close()
    
    def get_chunks(self, video_id):
        conn = self._get_conn()
        cur = conn.cursor()
        cur.execute('SELECT * FROM chunks WHERE video_id = ? ORDER BY chunk_id ASC', (video_id,))
        rows = cur.fetchall()
        
        # Transform back to dict format expected by API
        result = []
        for row in rows:
            r = dict(row)
            r['id'] = r['chunk_id'] # remap for API compatibility
            result.append(r)
            
        conn.close()
        return result
    
    # User authentication methods
    def create_user(self, user_data):
        conn = self._get_conn()
        cur = conn.cursor()
        now = datetime.utcnow()
        _id = str(uuid.uuid4())
        
        try:
            cur.execute('''INSERT INTO users 
                (_id, username, email, password_hash, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)''',
                (_id, user_data['username'], user_data['email'], user_data['password_hash'], now, now))
            conn.commit()
            
            # Match pymongo return object
            class InsertResult:
                inserted_id = _id
            return InsertResult()
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def get_user_by_email(self, email):
        conn = self._get_conn()
        cur = conn.cursor()
        cur.execute('SELECT * FROM users WHERE email = ?', (email,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    
    def get_user_by_username(self, username):
        conn = self._get_conn()
        cur = conn.cursor()
        cur.execute('SELECT * FROM users WHERE username = ?', (username,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    
    def get_user_by_id(self, user_id):
        conn = self._get_conn()
        cur = conn.cursor()
        cur.execute('SELECT * FROM users WHERE _id = ?', (user_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    
    def delete_video(self, video_id):
        conn = self._get_conn()
        cur = conn.cursor()
        try:
            # Delete chunks first due to foreign key (though sqlite enforce off by default usually)
            cur.execute('DELETE FROM chunks WHERE video_id = ?', (video_id,))
            cur.execute('DELETE FROM videos WHERE video_id = ?', (video_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"Database delete error: {e}")
            return False
        finally:
            conn.close()

    def close(self):
        pass

# Global database instance
db = Database()
