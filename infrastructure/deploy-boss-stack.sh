#!/bin/bash

echo "🚀 DEPLOYING THE BOSS STACK - TABLE 1837"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. CLOUDFLARE PAGES DEPLOYMENT
echo -e "${YELLOW}[1/6] Deploying to Cloudflare Pages...${NC}"
cd frontend
npm install
npm run build

# Install Wrangler CLI
npm install -g wrangler

# Deploy to Cloudflare Pages
wrangler pages publish dist \
  --project-name="table1837-glenrock" \
  --branch="main"

cd ..

# 2. CLOUDFLARE WORKERS DEPLOYMENT
echo -e "${YELLOW}[2/6] Deploying Cloudflare Workers...${NC}"
cd infrastructure
wrangler publish cloudflare-setup.js \
  --name="table1837-api" \
  --compatibility-date="2023-12-01"

# 3. NEON DATABASE SETUP
echo -e "${YELLOW}[3/6] Setting up Neon PostgreSQL...${NC}"
# Create database via Neon API
curl -X POST https://console.neon.tech/api/v2/projects \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project": {
      "name": "table1837-glenrock",
      "region_id": "aws-us-east-1"
    }
  }'

# Run schema
psql $NEON_DATABASE_URL < neon-schema.sql

# 4. DETA MICRO DEPLOYMENT
echo -e "${YELLOW}[4/6] Deploying Deta Microservices...${NC}"
# Install Deta CLI
curl -fsSL https://get.deta.dev/cli.sh | sh

# Deploy Python microservices
deta new --python table1837-api
deta deploy

# 5. CLOUDFLARE R2 BUCKET SETUP
echo -e "${YELLOW}[5/6] Creating R2 Storage Bucket...${NC}"
wrangler r2 bucket create table1837-assets

# Set CORS policy
cat > r2-cors.json << EOF
{
  "CORSRules": [{
    "AllowedOrigins": ["https://table1837-glenrock.pages.dev"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }]
}
EOF

wrangler r2 bucket cors put table1837-assets --file r2-cors.json

# 6. RAILWAY DEPLOYMENT (for always-hot services)
echo -e "${YELLOW}[6/6] Deploying to Railway...${NC}"
railway login
railway init --name table1837-backend
railway up

# Set environment variables
echo -e "${GREEN}Setting up environment variables...${NC}"

# Cloudflare Pages
wrangler pages secret put NEON_DATABASE_URL
wrangler pages secret put PUSHER_KEY
wrangler pages secret put CLERK_PUBLISHABLE_KEY

# Deta
deta env set NEON_DATABASE_URL=$NEON_DATABASE_URL
deta env set REDIS_URL=$RAILWAY_REDIS_URL
deta env set PUSHER_APP_ID=$PUSHER_APP_ID
deta env set PUSHER_KEY=$PUSHER_KEY
deta env set PUSHER_SECRET=$PUSHER_SECRET

echo -e "${GREEN}✅ BOSS STACK DEPLOYED!${NC}"
echo ""
echo "🌐 Frontend: https://table1837-glenrock.pages.dev"
echo "⚡ API: https://table1837-api.workers.dev"
echo "🗄️ Database: Neon PostgreSQL (10GB)"
echo "💾 Storage: Cloudflare R2"
echo "🔥 Microservices: Deta (always hot)"
echo "🚂 Backend: Railway"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure Clerk.dev authentication"
echo "2. Set up Pusher channels for real-time"
echo "3. Configure domain in Cloudflare"
echo "4. Enable Cloudflare Analytics"