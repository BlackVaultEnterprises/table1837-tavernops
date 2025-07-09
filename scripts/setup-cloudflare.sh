#!/bin/bash

# Table 1837 TavernOps - Cloudflare Pages Setup Script
# This script will help you set up Cloudflare Pages deployment

echo "🚀 Table 1837 TavernOps - Cloudflare Pages Setup"
echo "================================================"
echo ""

# Check if user has Cloudflare account
echo "📋 Prerequisites:"
echo "1. Cloudflare account (free tier works)"
echo "2. GitHub repository connected"
echo "3. API tokens ready"
echo ""
read -p "Do you have a Cloudflare account? (y/n): " has_cf_account

if [ "$has_cf_account" != "y" ]; then
    echo "👉 Please create a free Cloudflare account at: https://dash.cloudflare.com/sign-up"
    echo "Then run this script again."
    exit 1
fi

# Collect required information
echo ""
echo "📝 Please provide the following information:"
echo "(You can find these in your Cloudflare dashboard)"
echo ""

read -p "Cloudflare Account ID: " CF_ACCOUNT_ID
read -p "Cloudflare API Token (with Pages:Edit permission): " CF_API_TOKEN

# Create .env file for GitHub Actions
echo ""
echo "🔧 Creating GitHub Actions secrets file..."
cat > .github/secrets.env << EOF
# GitHub Actions Secrets - Add these to your repository settings
# Go to: https://github.com/BlackVaultEnterprises/table1837-tavernops/settings/secrets/actions

CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$CF_API_TOKEN
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZnVua3ktY2xhbS03Ni5jbGVyay5hY2NvdW50cy5kZXYk
VITE_PUSHER_KEY=625fe0afd24603ced384
VITE_PUSHER_CLUSTER=mt1
EOF

echo "✅ Secrets file created at .github/secrets.env"
echo ""

# Create Cloudflare Pages project using API
echo "🌐 Creating Cloudflare Pages project..."
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "table1837-tavernops",
    "production_branch": "main",
    "source": {
      "type": "github",
      "config": {
        "owner": "BlackVaultEnterprises",
        "repo_name": "table1837-tavernops",
        "production_branch": "main",
        "pr_comments_enabled": true,
        "deployments_enabled": true
      }
    },
    "build_config": {
      "build_command": "cd frontend && npm install && npm run build",
      "destination_dir": "frontend/dist",
      "root_dir": "",
      "web_analytics_tag": "",
      "web_analytics_token": ""
    },
    "deployment_configs": {
      "production": {
        "environment_variables": {
          "NODE_VERSION": "20",
          "VITE_CLERK_PUBLISHABLE_KEY": "pk_test_ZnVua3ktY2xhbS03Ni5jbGVyay5hY2NvdW50cy5kZXYk",
          "VITE_PUSHER_KEY": "625fe0afd24603ced384",
          "VITE_PUSHER_CLUSTER": "mt1"
        }
      },
      "preview": {
        "environment_variables": {
          "NODE_VERSION": "20",
          "VITE_CLERK_PUBLISHABLE_KEY": "pk_test_ZnVua3ktY2xhbS03Ni5jbGVyay5hY2NvdW50cy5kZXYk",
          "VITE_PUSHER_KEY": "625fe0afd24603ced384",
          "VITE_PUSHER_CLUSTER": "mt1"
        }
      }
    }
  }'

echo ""
echo "✅ Cloudflare Pages project created!"
echo ""

# Display next steps
echo "📋 Next Steps:"
echo "1. Add the secrets from .github/secrets.env to your GitHub repository:"
echo "   https://github.com/BlackVaultEnterprises/table1837-tavernops/settings/secrets/actions"
echo ""
echo "2. Your site will be available at:"
echo "   https://table1837-tavernops.pages.dev"
echo ""
echo "3. To add a custom domain:"
echo "   - Go to Cloudflare Pages dashboard"
echo "   - Select your project"
echo "   - Go to 'Custom domains' tab"
echo "   - Add your domain (e.g., table1837tavern.com)"
echo ""
echo "4. The site will automatically deploy on every push to main branch!"
echo ""
echo "🎉 Setup complete! Your restaurant platform is ready for deployment."