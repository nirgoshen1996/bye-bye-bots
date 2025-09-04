# 🚀 Quick Start Guide - BotCleaner SaaS

Get your BotCleaner SaaS application up and running in minutes!

## ⚡ **Prerequisites**

- **Docker & Docker Compose** installed
- **Node.js 18+** and **npm** (for local development)
- **Python 3.11+** and **pip** (for local development)
- **Git** for version control

## 🏃‍♂️ **Quick Start (Docker)**

### **1. Clone & Setup**
```bash
git clone <your-repo-url>
cd bot-cleaner-SaaS
```

### **2. Environment Setup**
```bash
# Copy environment templates
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
```

### **3. Start All Services**
```bash
docker compose up --build
```

**That's it!** Your application will be available at:
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:8000
- 📊 **API Docs**: http://localhost:8000/docs

## 🔧 **Local Development Setup**

### **Frontend (Next.js)**
```bash
cd apps/web
npm install
npm run dev
```

### **Backend (FastAPI)**
```bash
cd apps/server
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🌟 **First Steps**

### **1. Test the Application**
- Visit http://localhost:3000
- Click "Start Cleaning" → "Upload"
- Upload a small CSV file with email addresses
- Map the email column
- Process and download results

### **2. Check API Health**
```bash
curl http://localhost:8000/health
# Should return: {"status": "ok"}
```

### **3. View API Documentation**
- Open http://localhost:8000/docs
- Explore available endpoints
- Test API calls directly

## 📁 **Project Structure Overview**

```
bot-cleaner-SaaS/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities & config
│   │   └── package.json    # Frontend dependencies
│   └── server/             # FastAPI backend
│       ├── app/            # API endpoints
│       ├── database/       # Schema & migrations
│       └── requirements.txt # Python dependencies
├── shared/                  # Common configs
├── docker-compose.yml       # Service orchestration
└── README.md               # Project documentation
```

## 🎯 **Key Features to Try**

### **Core Functionality**
- ✅ **CSV Upload**: Drag & drop file upload
- ✅ **Bot Detection**: Smart email analysis
- ✅ **Results Export**: Download processed files
- ✅ **User Dashboard**: Processing history

### **Advanced Features**
- 🔐 **Authentication**: Sign up/login (requires Supabase setup)
- 💳 **Billing System**: Subscription plans (requires Stripe setup)
- 📊 **Analytics**: Processing statistics and charts
- ⚙️ **Advanced Options**: MX checking, email validation

## 🚨 **Common Issues & Solutions**

### **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend

# Kill the process or change ports in docker-compose.yml
```

### **Docker Build Failures**
```bash
# Clean Docker cache
docker system prune -a
docker compose build --no-cache
```

### **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

### **Dependencies Not Found**
```bash
# Frontend
cd apps/web && rm -rf node_modules package-lock.json && npm install

# Backend
cd apps/server && pip install -r requirements.txt --force-reinstall
```

## 🔐 **Authentication Setup (Optional)**

To enable user accounts and billing:

### **1. Supabase Setup**
- Create account at [supabase.com](https://supabase.com)
- Create new project
- Get project URL and anon key
- Update `apps/web/.env.local` and `apps/server/.env`

### **2. Stripe Setup**
- Create account at [stripe.com](https://stripe.com)
- Get API keys
- Create products and prices
- Update environment variables

### **3. Database Setup**
```bash
# Apply database schema
cd apps/server/database
# Run schema.sql in your Supabase SQL editor
```

## 📚 **Next Steps**

### **Development**
- 🧪 **Run Tests**: `npm run test` (frontend) / `pytest` (backend)
- 🔍 **Code Quality**: `npm run lint` (frontend) / `ruff check` (backend)
- 📝 **Format Code**: `npm run format` (frontend) / `black .` (backend)

### **Production**
- 🚀 **Build**: `npm run build` (frontend) / `pip install -r requirements.txt` (backend)
- 🐳 **Deploy**: Use Docker Compose or container orchestration
- 🔒 **Security**: Configure production environment variables
- 📊 **Monitoring**: Set up logging and health checks

### **Customization**
- 🎨 **Branding**: Update colors, logos, and themes
- 🔧 **Configuration**: Modify bot detection rules and thresholds
- 📱 **Mobile**: Optimize responsive design
- 🌍 **Internationalization**: Add multi-language support

## 🆘 **Need Help?**

### **Documentation**
- 📖 **Full Setup Guide**: See `SUPABASE_SETUP.md` and `STRIPE_SETUP.md`
- 🏗️ **Architecture**: See `IMPLEMENTATION_SUMMARY.md`
- 🔧 **API Reference**: Visit http://localhost:8000/docs

### **Troubleshooting**
- 🔍 **Check Logs**: `docker compose logs -f`
- 🐛 **Debug Mode**: Set `DEBUG=true` in environment
- 💬 **Community**: Check project issues and discussions

---

## 🎉 **You're All Set!**

Your BotCleaner SaaS application is now running locally. Start exploring the features, customize the bot detection rules, and prepare for production deployment!

**Happy coding! 🚀**

