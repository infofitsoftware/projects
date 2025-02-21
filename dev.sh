#!/bin/bash

# Ensure we're using development environment
cp .env.development .env

# Run Flask development server
flask run 