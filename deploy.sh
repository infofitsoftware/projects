#!/bin/bash

echo "🚀 Starting deployment process..."

# 1. Ensure we're using production environment
echo "📝 Setting up production environment..."
cp .env.production .env

# 2. Create public directory if it doesn't exist
echo "📁 Creating public directory..."
mkdir -p public

# 3. Copy static files
echo "📂 Syncing static files..."
python sync_static.py

# 4. Copy HTML templates to public directory
echo "📄 Copying HTML files..."
cp templates/login.html public/index.html
cp templates/editor.html public/editor.html
cp templates/viewer.html public/viewer.html

# 5. Build and deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment complete!" 