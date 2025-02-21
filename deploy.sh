#!/bin/bash

# Ensure we're using production environment
cp .env.production .env

# Sync static files
python sync_static.py

# Build and deploy to Firebase
firebase deploy 