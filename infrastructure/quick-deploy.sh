#!/bin/bash

echo "🚀 QUICK DEPLOY TO FREE CLOUDFLARE PAGES"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm install
npm run build

echo -e "${GREEN}✅ Build complete!${NC}"

echo ""
echo -e "${YELLOW}Now do these steps:${NC}"
echo ""
echo "1. Go to: https://pages.cloudflare.com"
echo "2. Sign up/Login (FREE)"
echo "3. Click 'Create a project'"
echo "4. Choose 'Connect to Git'"
echo "5. Select your GitHub repo: BlackVaultEnterprises/table1837-tavernops"
echo "6. Configure build settings:"
echo "   - Build command: cd frontend && npm install && npm run build"
echo "   - Build output directory: frontend/dist"
echo "7. Click 'Deploy site'"
echo ""
echo -e "${GREEN}Your site will be live at: https://table1837-tavern.pages.dev${NC}"
echo ""
echo "Later, when you get a domain, just:"
echo "1. Go to your Cloudflare Pages project"
echo "2. Custom domains → Add"
echo "3. Enter your new domain"
echo ""
echo -e "${YELLOW}Alternative: Deploy to Netlify${NC}"
echo "Run: npx netlify-cli deploy --prod --dir=frontend/dist"