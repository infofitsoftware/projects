import shutil
import os

def sync_static_folders():
    """Sync contents between static and public/static folders"""
    static_dir = 'static'
    public_static_dir = os.path.join('public', 'static')
    
    # Create public/static if it doesn't exist
    os.makedirs(public_static_dir, exist_ok=True)
    
    # Copy from static to public/static
    for root, dirs, files in os.walk(static_dir):
        for file in files:
            src_path = os.path.join(root, file)
            # Get relative path from static directory
            rel_path = os.path.relpath(src_path, static_dir)
            dst_path = os.path.join(public_static_dir, rel_path)
            # Create destination directory if it doesn't exist
            os.makedirs(os.path.dirname(dst_path), exist_ok=True)
            # Copy file
            shutil.copy2(src_path, dst_path)
    
    print("Static files synced successfully!")

if __name__ == "__main__":
    sync_static_folders() 