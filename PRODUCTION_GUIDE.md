# Production Deployment Guide - The Unusual Chop Planner

## Pre-Deployment Checklist

- [x] Remove all console.log and debug statements
- [x] Remove test components (AppTest.tsx)
- [x] Create .env.example files with placeholders
- [x] Add .env files to .gitignore
- [x] Optimize server logs for production
- [x] Verify TypeScript strict mode is enabled
- [x] Test complete build pipeline

## Environment Setup

### 1. Frontend Environment (.env)

Create a `.env` file in the root directory (copy from `.env.example`):

```env
VITE_API_URL=https://your-api-domain.com
```

For local development:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Backend Environment (server/.env)

Create a `server/.env` file (copy from `server/.env.example`):

```env
PORT=5000
JWT_SECRET=your-very-long-random-string-at-least-32-characters
MONGODB_URI=mongodb+srv://unusual_food_user:PASSWORD@YOUR_CLUSTER_NAME.mongodb.net/unusual_food?retryWrites=true&w=majority
NODE_ENV=production
```

### 3. Email configuration (optional but required for password resets)

The server uses **Google SMTP** to send password reset emails. If SMTP credentials are not provided, reset tokens are logged to the console (useful for local testing).

**Google SMTP setup:**

1. Use a Google account or create one (can be a business Gmail account)
2. Enable [2-Step Verification](https://myaccount.google.com/security) on the account
3. Generate an [App Password](https://myaccount.google.com/apppasswords) (select "Mail" and "Windows Computer")
4. Add to `server/.env`:

   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

   The sender address will be your Gmail address (from `SMTP_USER`).



**DO NOT commit these .env files to version control.**

## Building for Production

### Frontend Build

```bash
# Install dependencies
npm install

# Build the app (creates optimized dist folder)
npm run build

# Preview production build locally
npm run preview
```

The `dist` folder contains your production-ready static files.

### Backend Deployment

```bash
cd server
npm install --production
```

## Hosting Options

### Frontend (Static Files)

Choose one of these hosting options:

**Option 1: Vercel (Recommended for Vite apps)**
```bash
npm i -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm run build
# Upload the 'dist' folder to Netlify
```

**Option 3: GitHub Pages**
- Static builds are automatically deployed via the `.github/workflows/deploy.yml` workflow

### Backend (Node.js Server)

**Option 1: Vercel**
- Deploy the entire repo to Vercel
- Backend API functions are auto-handled

**Option 2: Heroku**
```bash
heroku create your-app-name
git push heroku main
```

**Option 3: Render.com**
- Connect your GitHub repository
- Set build command: `npm install && cd server && npm install`
- Set start command: `npm start` (from server directory)

**Option 4: AWS/DigitalOcean/Linode**
- Deploy using Docker or direct Node.js setup

## Security Checklist for Production

- ✅ Update JWT_SECRET to a long, random string (minimum 32 characters)
- ✅ Enable HTTPS for all API calls
- ✅ Set secure CORS origins (not `*`)
- ✅ Use environment variables for all secrets
- ✅ Enable MongoDB authentication
- ✅ Set up HTTPS/SSL certificate
- ✅ Rate limiting on API endpoints
- ✅ Password hashing enabled (bcryptjs already configured)
- ✅ Validate all user inputs

## MongoDB Atlas Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user (Database Access → Add New Database User)
3. Whitelist IP addresses (Network Access)
4. Get connection string from Connect → Drivers
5. Add to `server/.env` as `MONGODB_URI`

## Deployment Steps

### Step 1: Prepare Code
```bash
# Ensure all changes are committed
git status

# Create a production branch
git checkout -b production
```

### Step 2: Test Production Build Locally
```bash
npm run build
npm run preview

cd server
npm start
```

### Step 3: Deploy Backend
Choose your hosting provider and follow their deployment steps.

### Step 4: Deploy Frontend
```bash
npm run build
# Upload dist folder to your chosen host
```

### Step 5: Update Frontend API URL
If your backend API domain changes, update it in your hosting provider's environment variables:
```
VITE_API_URL=https://your-backend-api.com
```

## Monitoring & Maintenance

1. **Monitor API logs** - Check server logs for errors
2. **Monitor database** - Use MongoDB Atlas dashboard
3. **Monitor frontend** - Use browser DevTools and error tracking
4. **Update dependencies** - Run `npm outdated` periodically
5. **Backup MongoDB** - Set up automatic backups in Atlas

## Performance Optimization

✅ Already configured:
- Minification via Vite
- Tree-shaking of unused code
- Lazy loading of images (loading="lazy")
- Optimized Tailwind CSS build
- React StrictMode warnings in development

Additional recommendations:
- Add CDN for static assets
- Enable gzip compression on server
- Use caching headers for assets
- Consider image optimization service

## Troubleshooting

**API connection fails:**
- Check `VITE_API_URL` environment variable
- Verify backend is running
- Check CORS settings in `server/index.js`
- Review firewall/network rules

**MongoDB connection fails:**
- Verify `MONGODB_URI` format
- Check IP whitelist in MongoDB Atlas
- Ensure database user credentials are correct

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist && npm run build`
- Check for TypeScript errors: `npx tsc --noEmit`
