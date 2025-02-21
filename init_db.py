import firebase_admin
from firebase_admin import credentials, db
import json

def init_database():
    try:
        # Initialize Firebase Admin
        cred = credentials.Certificate('serviceAccountKey.json')
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://utrainscodeshare-default-rtdb.firebaseio.com'
        })

        # Create test data
        test_data = {
            'notes': {
                'test_session': {
                    'content': {
                        'ops': [
                            {'insert': 'Welcome to Classroom Notes!\n'}
                        ]
                    },
                    'last_updated': {'.sv': 'timestamp'}
                }
            }
        }

        # Update database
        ref = db.reference('/')
        ref.set(test_data)

        # Verify write
        result = ref.get()
        print("Database initialized successfully!")
        print("Test data:", result)
        return True

    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        return False

if __name__ == "__main__":
    init_database() 