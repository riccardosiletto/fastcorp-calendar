# Deployment Guide - FastCorp TaskFlow

This guide will help you deploy TaskFlow to a subdomain on FastCorp.ch

## Quick Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
npm run build
vercel --prod
```

4. **Configure Custom Domain**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Domains
   - Add your subdomain (e.g., `tasks.fastcorp.ch`)
   - Add the DNS records provided by Vercel to your FastCorp.ch domain

### Option 2: Netlify

1. **Build the project**
```bash
npm run build
```

2. **Deploy via Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

3. **Configure Custom Domain**
   - Go to Site settings → Domain management
   - Add custom domain: `tasks.fastcorp.ch`
   - Configure DNS as instructed

### Option 3: Traditional Web Hosting (cPanel/FTP)

1. **Build the production version**
```bash
npm run build
```

2. **Upload Files**
   - The `dist` folder contains all production files
   - Upload the contents of `dist` to your subdomain directory
   - Typical path: `/public_html/tasks/` or `/subdomains/tasks/public_html/`

3. **Configure Subdomain**
   - In cPanel, go to Domains → Subdomains
   - Create subdomain: `tasks.fastcorp.ch`
   - Point document root to the uploaded directory

### Option 4: AWS S3 + CloudFront (Enterprise)

1. **Build the project**
```bash
npm run build
```

2. **Create S3 Bucket**
   - Name: `tasks-fastcorp-ch`
   - Enable static website hosting
   - Upload `dist` contents

3. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Enable HTTPS
   - Add custom domain: `tasks.fastcorp.ch`

4. **Configure Route 53**
   - Create A record for `tasks.fastcorp.ch`
   - Alias to CloudFront distribution

## DNS Configuration

For all options, you'll need to configure DNS for your subdomain:

### A Record Method
```
Type: A
Host: tasks
Value: [Your server IP]
TTL: 3600
```

### CNAME Method
```
Type: CNAME
Host: tasks
Value: [Your hosting provider's domain]
TTL: 3600
```

## SSL/HTTPS Configuration

### Free SSL with Let's Encrypt
Most hosting providers offer free SSL certificates via Let's Encrypt. Ensure HTTPS is enabled:

- **Vercel/Netlify**: Automatic HTTPS
- **cPanel**: AutoSSL or Let's Encrypt plugin
- **CloudFront**: AWS Certificate Manager (ACM)

## Environment Variables

If you need to add environment variables for production:

1. Create `.env.production` file:
```env
VITE_API_URL=https://api.fastcorp.ch
VITE_APP_NAME=TaskFlow
```

2. Variables are accessible via `import.meta.env.VITE_*`

## Performance Optimization

### Before Deployment

1. **Optimize Build**
```bash
npm run build
```

2. **Test Production Build Locally**
```bash
npm run preview
```

3. **Check Bundle Size**
```bash
npm run build -- --mode analyze
```

### After Deployment

1. Enable Gzip/Brotli compression
2. Configure CDN caching
3. Set up monitoring (e.g., Sentry, LogRocket)

## Subdomain Structure Recommendation

```
tasks.fastcorp.ch          → Main TaskFlow application
tasks.fastcorp.ch/api      → API endpoint (if needed)
tasks.fastcorp.ch/assets   → Static assets (handled by Vite)
```

## Troubleshooting

### Issue: 404 on page refresh

**Solution**: Configure server to redirect all routes to `index.html`

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** - Create `_redirects` in `public/`:
```
/*    /index.html   200
```

**Apache** - Create `.htaccess`:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Issue: White screen after deployment

1. Check browser console for errors
2. Verify all assets are loading (check Network tab)
3. Ensure base URL is correct in `vite.config.js`

### Issue: Slow load times

1. Enable compression on server
2. Configure CDN
3. Check if all assets are being cached properly

## Post-Deployment Checklist

- [ ] Site loads correctly on `https://tasks.fastcorp.ch`
- [ ] SSL certificate is active (green padlock)
- [ ] All pages are accessible (Dashboard, Calendar, Projects, Timeline)
- [ ] Drag and drop functionality works
- [ ] Data persists in localStorage
- [ ] Mobile responsive design works
- [ ] Browser console shows no errors
- [ ] All assets load from correct paths

## Maintenance

### Regular Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build and deploy
npm run build
vercel --prod  # or your deployment method
```

### Backup

TaskFlow uses browser localStorage. For enterprise backup:
1. Implement backend API
2. Set up database (PostgreSQL, MongoDB)
3. Add user authentication
4. Schedule regular backups

## Support

For deployment issues specific to FastCorp.ch infrastructure, contact your IT team or hosting provider.

---

Happy deploying! 🚀

