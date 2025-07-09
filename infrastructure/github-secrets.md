# GitHub Secrets Configuration

Add these secrets to your GitHub repository:
Settings → Secrets and variables → Actions → New repository secret

## Required Secrets

### Cloudflare
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Neon Database
- `NEON_DATABASE_URL` - Production database URL
- `NEON_DATABASE_PASSWORD` - Database password
- `STAGING_NEON_DATABASE_URL` - Staging database URL

### Pusher
- `PUSHER_APP_ID` - Pusher app ID
- `PUSHER_KEY` - Pusher public key
- `PUSHER_SECRET` - Pusher secret key
- `PUSHER_CLUSTER` - Pusher cluster (e.g., us2)
- `STAGING_PUSHER_KEY` - Staging Pusher key

### Clerk Auth
- `CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key

### Deta
- `DETA_ACCESS_TOKEN` - Deta access token

### Sentry
- `SENTRY_DSN` - Production Sentry DSN
- `SENTRY_AUTH_TOKEN` - For creating releases
- `SENTRY_ORG` - Your Sentry organization
- `STAGING_SENTRY_DSN` - Staging Sentry DSN

### Optional
- `CUSTOM_DOMAIN` - Your custom domain (if using)

## How to get these values:

1. **Cloudflare**: Dashboard → My Profile → API Tokens
2. **Neon**: Dashboard → Connection Details
3. **Pusher**: Dashboard → App Keys
4. **Clerk**: Dashboard → API Keys
5. **Deta**: Dashboard → Settings → Access Tokens
6. **Sentry**: Settings → Projects → Client Keys