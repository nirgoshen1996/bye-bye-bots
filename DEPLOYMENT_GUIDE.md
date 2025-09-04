# 🚀 Deployment Guide - ByeByeBots.io

This guide will walk you through deploying your ByeByeBots.io SaaS application to production.

## 📋 **Prerequisites**

- GitHub repository with your code
- Vercel account (for frontend)
- Railway account (for backend) or Render account (alternative)
- Supabase project
- Stripe account
- Domain name (byebyebots.io)

## 🎯 **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Services      │
│   (Vercel)      │    │   (Railway)     │    │                 │
│                 │    │                 │    │                 │
│ byebyebots.io   │◄──►│ api.byebyebots.io│◄──►│ Supabase        │
│ www.byebyebots.io│    │                 │    │ Stripe          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎨 **Frontend Deployment (Vercel)**

### 1. **Prepare Your Repository**

Ensure your frontend code is in the `apps/web` directory and includes:
- `vercel.json` configuration
- `package.json` with build scripts
- Environment variables template

### 2. **Deploy to Vercel**

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `apps/web`

2. **Configure Environment Variables**:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://api.byebyebots.io
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
   NEXT_PUBLIC_FRONTEND_URL=https://byebyebots.io
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Note the deployment URL

### 3. **Configure Custom Domain**

1. **Add Domain**:
   - Go to Project Settings → Domains
   - Add `byebyebots.io`
   - Add `www.byebyebots.io`

2. **DNS Configuration**:
   - Add A record: `@` → Vercel IP
   - Add CNAME record: `www` → `cname.vercel-dns.com`

## ⚙️ **Backend Deployment (Railway)**

### 1. **Prepare Your Repository**

Ensure your backend code is in the `apps/server` directory and includes:
- `Dockerfile`
- `railway.json` configuration
- `requirements.txt`

### 2. **Deploy to Railway**

1. **Connect Repository**:
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set **Root Directory** to `apps/server`

2. **Configure Environment Variables**:
   ```bash
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   FRONTEND_URL=https://byebyebots.io
   SECRET_KEY=your_secret_key_for_jwt_tokens
   ALLOWED_ORIGINS=https://byebyebots.io,https://www.byebyebots.io
   ```

3. **Deploy**:
   - Railway will automatically build and deploy
   - Note the generated URL

### 3. **Configure Custom Domain**

1. **Add Domain**:
   - Go to Project Settings → Domains
   - Add `api.byebyebots.io`
   - Copy the CNAME record

2. **DNS Configuration**:
   - Add CNAME record: `api` → Railway domain

## 🔧 **Alternative: Backend Deployment (Render)**

If you prefer Render over Railway:

### 1. **Deploy to Render**

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set **Root Directory** to `apps/server`

2. **Configure Service**:
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`

3. **Environment Variables**: Same as Railway

4. **Deploy**: Click "Create Web Service"

## 🗄️ **Database Setup (Supabase)**

### 1. **Create Supabase Project**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Note your project URL and API keys

### 2. **Run Database Migrations**

1. **Connect to Supabase**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   ```

2. **Run Migrations**:
   ```bash
   # Apply the schema
   supabase db push
   ```

### 3. **Configure Storage**

1. **Create Storage Bucket**:
   - Go to Storage in Supabase Dashboard
   - Create bucket named `exports`
   - Set to public if needed

2. **Set Up RLS Policies**:
   - Apply the policies from `database/schema.sql`

## 💳 **Payment Setup (Stripe)**

### 1. **Create Stripe Products**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products for your pricing plans:
   - Pro Plan ($29/month)
   - Master 100K ($49/month)
   - Master 250K ($99/month)
   - Master 500K ($199/month)
   - Credit Packs (10K, 50K, 100K)

### 2. **Configure Webhooks**

1. **Add Webhook Endpoint**:
   - URL: `https://api.byebyebots.io/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, etc.

2. **Get Webhook Secret**:
   - Copy the webhook signing secret
   - Add to backend environment variables

## 🌐 **DNS Configuration**

### 1. **Domain Provider Setup**

Configure these DNS records with your domain provider:

```
Type    Name    Value
A       @       Vercel IP (from Vercel dashboard)
CNAME   www     cname.vercel-dns.com
CNAME   api     your-railway-domain.railway.app
```

### 2. **SSL Certificates**

- Vercel: Automatic SSL for frontend
- Railway: Automatic SSL for backend
- Both will handle HTTPS automatically

## 🔐 **Security Configuration**

### 1. **Environment Variables**

**Frontend (Vercel)**:
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.byebyebots.io
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
NEXT_PUBLIC_FRONTEND_URL=https://byebyebots.io
```

**Backend (Railway/Render)**:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=https://byebyebots.io
SECRET_KEY=your_jwt_secret_key
ALLOWED_ORIGINS=https://byebyebots.io,https://www.byebyebots.io
```

### 2. **CORS Configuration**

The backend is configured to accept requests from:
- `https://byebyebots.io`
- `https://www.byebyebots.io`

## 📊 **Monitoring & Analytics**

### 1. **Vercel Analytics**

- Enable Vercel Analytics in project settings
- Monitor performance and user behavior

### 2. **Railway/Render Monitoring**

- Use built-in monitoring dashboards
- Set up alerts for downtime

### 3. **Error Tracking**

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user analytics

## 🚀 **Deployment Checklist**

### Pre-Deployment
- [ ] Code is in GitHub repository
- [ ] All environment variables are ready
- [ ] Database schema is prepared
- [ ] Stripe products are created
- [ ] Domain is purchased

### Frontend (Vercel)
- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Custom domain added
- [ ] DNS records configured
- [ ] SSL certificate active

### Backend (Railway/Render)
- [ ] Repository connected
- [ ] Environment variables configured
- [ ] Custom domain added
- [ ] DNS records configured
- [ ] Health check endpoint working

### Database (Supabase)
- [ ] Project created
- [ ] Schema applied
- [ ] Storage bucket created
- [ ] RLS policies configured
- [ ] API keys configured

### Payment (Stripe)
- [ ] Products created
- [ ] Webhooks configured
- [ ] API keys configured
- [ ] Test payments working

### Final Testing
- [ ] Frontend loads at byebyebots.io
- [ ] Backend API responds at api.byebyebots.io
- [ ] User registration works
- [ ] File upload works
- [ ] Payment processing works
- [ ] Email cleaning works

## 🔧 **Troubleshooting**

### Common Issues

1. **CORS Errors**:
   - Check `ALLOWED_ORIGINS` in backend
   - Verify frontend URL is correct

2. **Database Connection**:
   - Verify Supabase URL and keys
   - Check RLS policies

3. **Payment Issues**:
   - Verify Stripe keys are live (not test)
   - Check webhook endpoint is accessible

4. **Domain Issues**:
   - DNS propagation can take 24-48 hours
   - Check DNS records are correct

### Support

- **Vercel**: [Vercel Support](https://vercel.com/support)
- **Railway**: [Railway Support](https://railway.app/support)
- **Supabase**: [Supabase Support](https://supabase.com/support)
- **Stripe**: [Stripe Support](https://support.stripe.com)

## 🎉 **Success!**

Once deployed, your ByeByeBots.io SaaS will be live at:
- **Frontend**: https://byebyebots.io
- **Backend**: https://api.byebyebots.io

Your application is now ready to serve customers and process email cleaning requests!
