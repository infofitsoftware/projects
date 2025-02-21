from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from functools import wraps
import firebase_admin
from firebase_admin import credentials, db, auth
import time
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Determine if we're in development or production
is_production = os.getenv('FLASK_ENV') == 'production'

# Initialize Flask app
if is_production:
    app = Flask(__name__, static_folder='public/static')
else:
    app = Flask(__name__, static_folder='static')

app.secret_key = os.getenv('SECRET_KEY', 'default-secret-key')

# Initialize Firebase Admin
try:
    if os.path.exists('serviceAccountKey.json'):
        cred = credentials.Certificate('serviceAccountKey.json')
    else:
        cred_dict = json.loads(os.getenv('FIREBASE_SERVICE_ACCOUNT', '{}'))
        cred = credentials.Certificate(cred_dict)

    firebase_admin.initialize_app(cred, {
        'databaseURL': os.getenv('FIREBASE_DATABASE_URL')
    })
except Exception as e:
    print(f"Firebase initialization error: {e}")
    raise

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.args.get('token')
        
        if not token and 'user_token' in session:
            token = session['user_token']
            
        if not token:
            return redirect(url_for('home'))
            
        try:
            decoded_token = auth.verify_id_token(token)
            if 'user_token' not in session:
                session['user_token'] = token
            request.user = decoded_token
            return f(*args, **kwargs)
        except:
            session.clear()
            return redirect(url_for('home'))
            
    return decorated_function

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/editor')
@require_auth
def editor():
    return render_template('editor.html')

@app.route('/view/<session_id>')
def viewer(session_id):
    try:
        # Verify the session exists
        ref = db.reference(f'notes/{session_id}')
        if not ref.get():
            return "Session not found", 404
        return render_template('viewer.html', session_id=session_id)
    except Exception as e:
        print(f"Error accessing session: {str(e)}")
        return "Error accessing session", 500

@app.route('/api/notes/<session_id>', methods=['POST'])
@require_auth
def update_notes(session_id):
    try:
        data = request.get_json()
        if not data or 'content' not in data:
            return jsonify({'error': 'No content provided'}), 400

        # Update notes in Firebase
        ref = db.reference(f'notes/{session_id}')
        update_data = {
            'content': data['content'],
            'last_updated': {'.sv': 'timestamp'},
            'user_id': request.user['uid'],
            'user_email': request.user.get('email', '')
        }
        
        # Perform the update
        ref.set(update_data)
        
        # Return success response
        return jsonify({
            'status': 'success',
            'timestamp': int(time.time() * 1000)
        })

    except Exception as e:
        print(f"Error saving notes: {str(e)}")  # Debug log
        return jsonify({'error': 'Failed to save notes', 'details': str(e)}), 500

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

if __name__ == '__main__':
    if is_production:
        port = int(os.getenv('PORT', 8080))
        app.run(host='0.0.0.0', port=port)
    else:
        app.run(debug=True, port=5000) 