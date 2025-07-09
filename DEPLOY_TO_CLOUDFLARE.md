# 🚀 Deploy Table 1837 TavernOps to Cloudflare Pages

## Option 1: Direct Deploy (Easiest - 2 minutes)

1. **Click this link to deploy:**
   
   [![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/BlackVaultEnterprises/table1837-tavernops)

2. **Or manually deploy:**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com)
   - Click "Create a project" → "Connect to Git"
   - Authorize GitHub and select `BlackVaultEnterprises/table1837-tavernops`
   - Use these settings:
     ```
     Framework preset: None
     Build command: cd frontend && npm install && npm run build
     Build output directory: frontend/dist
     ```
   - Click "Save and Deploy"

3. **Add environment variables** (in Cloudflare Pages settings):
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZnVua3ktY2xhbS03Ni5jbGVyay5hY2NvdW50cy5kZXYk
   VITE_PUSHER_KEY=625fe0afd24603ced384
   VITE_PUSHER_CLUSTER=mt1
   ```

## Option 2: Automated Setup (5 minutes)

Run the setup script:
```bash
./scripts/setup-cloudflare.sh
```

This will:
- Create the Cloudflare Pages project
- Configure build settings
- Set up environment variables
- Enable automatic deployments

## 🌐 Your Sites

After deployment, your site will be available at:
- **Production**: https://table1837-tavernops.pages.dev
- **Custom Domain**: Add `table1837tavern.com` in Cloudflare Pages settings

## 🔄 Automatic Deployments

Every push to the `main` branch will automatically deploy to production!

## 📱 Features Included

- ✅ Progressive Web App (installable)
- ✅ Offline support
- ✅ Real-time updates (Pusher)
- ✅ Authentication (Clerk)
- ✅ Glassmorphic UI
- ✅ Mobile responsive
- ✅ SEO optimized
- ✅ Performance optimized

## 🆘 Need Help?

- Check build logs in Cloudflare Pages dashboard
- Ensure all environment variables are set
- Verify GitHub connection is authorized