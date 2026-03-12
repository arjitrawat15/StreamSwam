from flask import Blueprint, request, jsonify, make_response
from .database import db
from .auth import hash_password, verify_password, generate_token, verify_token, require_auth
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password (min 8 characters)"""
    return len(password) >= 8

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Create new user account
    Expected JSON: {"username": str, "email": str, "password": str}
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validate username
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        
        # Validate email
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password
        if not validate_password(password):
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Check if user already exists
        if db.get_user_by_email(email):
            return jsonify({'error': 'Email already registered'}), 409
        
        if db.get_user_by_username(username):
            return jsonify({'error': 'Username already taken'}), 409
        
        # Hash password
        password_hash = hash_password(password)
        
        # Create user
        user_id = db.create_user(username, email, password_hash)
        
        # Generate token
        token = generate_token(user_id, username, email)
        
        # Create response
        response = make_response(jsonify({
            'message': 'User created successfully',
            'user_id': user_id,
            'username': username,
            'email': email,
            'token': token
        }), 201)
        
        # Set token in cookie
        response.set_cookie(
            'token',
            token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            max_age=7*24*60*60  # 7 days
        )
        
        return response
    
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/signin', methods=['POST'])
def signin():
    """
    Sign in user
    Expected JSON: {"email": str, "password": str}
    """
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Missing email or password'}), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        # Get user
        user = db.get_user_by_email(email)
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(str(user['_id']), user['username'], user['email'])
        
        # Create response
        response = make_response(jsonify({
            'message': 'Sign in successful',
            'user_id': str(user['_id']),
            'username': user['username'],
            'email': user['email'],
            'token': token
        }), 200)
        
        # Set token in cookie
        response.set_cookie(
            'token',
            token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=7*24*60*60
        )
        
        return response
    
    except Exception as e:
        print(f"Signin error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/signout', methods=['POST'])
def signout():
    """Sign out user (clear token)"""
    response = make_response(jsonify({'message': 'Signed out successfully'}), 200)
    response.set_cookie('token', '', expires=0)
    return response

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """Get current authenticated user info"""
    try:
        user = db.get_user_by_id(request.user['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user_id': str(user['_id']),
            'username': user['username'],
            'email': user['email'],
            'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
        }), 200
    
    except Exception as e:
        print(f"Get current user error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
