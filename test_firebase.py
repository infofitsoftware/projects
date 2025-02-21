import firebase_admin
from firebase_admin import credentials, db

def test_firebase_connection():
    try:
        # Initialize Firebase Admin
        cred = credentials.Certificate('serviceAccountKey.json')
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'your-database-url'
        })
        
        # Try to read from database
        ref = db.reference('test')
        ref.set({'test': 'success'})
        result = ref.get()
        
        print("Firebase connection successful!")
        print(f"Test data: {result}")
        
        # Clean up test data
        ref.delete()
        
    except Exception as e:
        print(f"Firebase connection failed: {e}")

if __name__ == "__main__":
    test_firebase_connection() 