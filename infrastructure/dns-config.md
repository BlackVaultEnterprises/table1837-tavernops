# DNS Configuration for Custom Domain

## Cloudflare DNS Settings

Add these DNS records to your domain:

### For apex domain (table1837glenrock.com):
```
Type: CNAME
Name: @
Target: table1837-glenrock.pages.dev
Proxy: ON (Orange cloud)
TTL: Auto
```

### For www subdomain:
```
Type: CNAME
Name: www
Target: table1837-glenrock.pages.dev
Proxy: ON (Orange cloud)
TTL: Auto
```

### For API subdomain:
```
Type: CNAME
Name: api
Target: table1837-api.workers.dev
Proxy: ON (Orange cloud)
TTL: Auto
```

### For staging:
```
Type: CNAME
Name: staging
Target: staging.table1837-glenrock.pages.dev
Proxy: ON (Orange cloud)
TTL: Auto
```

## SSL/TLS Settings

In Cloudflare dashboard:
1. Go to SSL/TLS → Overview
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

## Page Rules (Free tier includes 3)

1. **Force HTTPS**
   - URL: `http://*table1837glenrock.com/*`
   - Setting: Always Use HTTPS

2. **Cache Images**
   - URL: `*table1837glenrock.com/*.jpg`
   - Settings: 
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month

3. **API Performance**
   - URL: `api.table1837glenrock.com/*`
   - Settings:
     - Cache Level: Bypass
     - Security Level: High

## Custom Domain Setup in Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Custom domains → Add custom domain
3. Add both:
   - `table1837glenrock.com`
   - `www.table1837glenrock.com`
4. Cloudflare will automatically handle SSL certificates