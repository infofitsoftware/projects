#!/bin/bash

echo "🚀 Starting deployment process..."

# 1. Ensure we're using production environment
echo "📝 Setting up production environment..."
cp .env.production .env

# 2. Create public directory structure
echo "📁 Creating public directory structure..."
mkdir -p public/static/css
mkdir -p public/static/js

# 3. Copy static files
echo "📂 Copying static files..."
cp -r static/css/* public/static/css/
cp -r static/js/* public/static/js/

# 4. Copy HTML templates
echo "📄 Copying HTML files..."
cp templates/login.html public/index.html
cp templates/editor.html public/editor.html
cp templates/viewer.html public/viewer.html

# 5. Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment complete!" 