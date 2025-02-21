import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin (if not already initialized)
try:
    app = firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

# Create teacher account with specific credentials
teacher_email = "teacher@utrains.com"  # You can change this email
teacher_password = "Utrains@2024"      # You can change this password

try:
    user = auth.create_user(
        email=teacher_email,
        password=teacher_password,
        email_verified=True
    )
    print(f"Teacher account created successfully!")
    print(f"Email: {teacher_email}")
    print(f"Password: {teacher_password}")
    print(f"UID: {user.uid}")
except Exception as e:
    print(f"Error creating teacher account: {e}") 