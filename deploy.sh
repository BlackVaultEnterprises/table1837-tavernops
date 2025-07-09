#!/bin/bash

echo "🚀 Deploying Table 1837 to Netlify..."

# Install Netlify CLI if not present
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Login to Netlify (using token from secrets)
export NETLIFY_AUTH_TOKEN="nfp_YXJz5bFcQisFi6N6EZKo2EGKQGQw7XzH6303"

# Create new site or link existing
netlify init --manual

# Deploy to Netlify
netlify deploy --prod --dir=frontend/dist

# Deploy functions
netlify functions:create menu-ocr

echo "✅ Deployment complete!"
echo "🌐 Your site is live at your Netlify URL"
echo ""
echo "Next steps:"
echo "1. Run the SQL schema in your Supabase dashboard"
echo "2. Configure environment variables in Netlify dashboard"
echo "3. Set up GitHub auto-deploy"