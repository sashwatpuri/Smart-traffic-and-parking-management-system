# 🚀 Render Deployment Guide - Complete Instructions

## ✅ What's Been Fixed & Prepared

Your backend is now **deployment-ready** with the following improvements:

### 1. **File System Organization**
✅ Created `.gitignore` - Prevents node_modules, uploads, and .env from being committed
✅ Created `uploadService.js` - Ensures upload directories exist on startup
✅ Automatic directory creation on server boot

### 2. **Environment Configuration**
✅ Updated `config/env.js` - Production-ready CORS defaults
✅ Enhanced `.env.example` - Clear documentation for all config options
✅ Node.js version specification (18+) in package.json

### 3. **Build & Deployment**
✅ Added build script to `package.json`
✅ Created `Procfile` for Render
✅ Created `render.yaml` for Render auto-detection
✅ Proper start command listening on `0.0.0.0:` for container compatibility

### 4. **Error Handling & Startup**
✅ Validates all required environment variables before startup
✅ Improved MongoDB connection with timeout and retry logic
✅ Graceful shutdown handlers (SIGTERM/SIGINT)
✅ Better error messages for debugging
✅ Proper process exit codes

---

## 🔧 Step-by-Step Deployment on Render

### **STEP 1: Prepare GitHub Repository**

```bash
cd /path/to/MIT_VPU

# Add all changes
git add .

# Commit
git commit -m "feat: deployment-ready backend with production config"

# Push to GitHub
git push origin main
```

---

### **STEP 2: Set Up MongoDB Atlas**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign up** (free tier available)
3. **Create a Project:**
   - Click "Create a Project"
   - Name it: `traffic-management`
   - Click "Next"

4. **Create a Cluster:**
   - Select **Free Tier**
   - Select region closest to you
   - Click "Create Cluster"

5. **Security Quickstart:**
   - Choose "Create a database user"
   - **Username:** `traffic_admin`
   - **Password:** Generate strong password (save this!)
   - Click "Create User"

6. **Network Access:**
   - Click "Add Entry"
   - IP Address: `0.0.0.0/0` (Allow from anywhere - needed for Render)
   - Click "Confirm"

7. **Get Connection String:**
   - Go to "Databases" → Your cluster → "Connect"
   - Choose "Connect your application"
   - Select: **Node.js** v4.0 or later
   - Copy the connection string

   **Format:** 
   ```
   mongodb+srv://traffic_admin:<password>@cluster1.xxx.mongodb.net/traffic_management?retryWrites=true&w=majority
   ```
   
   Replace `<password>` with the password you generated

---

### **STEP 3: Deploy Backend on Render**

1. Go to [render.com](https://render.com)
2. **Sign up with GitHub**
3. Click **"New +"** → **"Web Service"**

4. **Connect Repository:**
   - Select your GitHub account
   - Choose `MIT_VPU` repo
   - Click "Connect"

5. **Configure Service:**

| Field | Value |
|-------|-------|
| Name | `traffic-backend` |
| Environment | `Node` |
| Region | Choose closest |
| Branch | `main` |
| Build Command | `npm install --production` |
| Start Command | `cd backend && npm start` |
| Plan | `Starter` ($7/month) or Free |

> **Note:** Free tier spins down after 15 min inactivity. Use Starter ($7/mo) for always-on.

6. **Click "Advanced"** and add Environment Variables:

```
PORT=5000

NODE_ENV=production

MONGODB_URI=mongodb+srv://traffic_admin:YOUR_PASSWORD@cluster.mongodb.net/traffic_management?retryWrites=true&w=majority

JWT_ACCESS_SECRET=(Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

JWT_REFRESH_SECRET=(Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

JWT_ACCESS_TTL=15m

JWT_REFRESH_TTL=30d

CORS_ORIGIN=https://your-frontend-domain.com

PAYMENT_PROVIDER=mock

ML_ENABLED=false

DEFAULT_ADMIN_EMAIL=admin@traffic.gov

DEFAULT_ADMIN_PASSWORD=admin123

DEFAULT_ADMIN_PHONE=9999999999
```

7. Click **"Create Web Service"**
8. Render will deploy automatically
9. **Wait for green checkmark** ✅

---

### **STEP 4: Verify Deployment**

Once deployment completes:

1. **Find your backend URL** (from Render dashboard)
   - Format: `https://traffic-backend.onrender.com`

2. **Test Health Check:**
   ```
   https://traffic-backend.onrender.com/api/health
   ```
   
   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-04-11T10:30:00.000Z",
     "services": {
       "mongodb": true,
       "socketio": true,
       "ml_backend": true
     }
   }
   ```

3. **Test Login Endpoint:**
   ```bash
   curl -X POST https://traffic-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@traffic.gov","password":"admin123"}'
   ```

---

## ⚠️ Important Notes

### **Native Dependencies**
- `sharp` and `onnxruntime` require build tools
- Render handles this automatically ✅

### **File Uploads**
- Local files disappear on Render restart
- **Recommended solutions** (pick one):
  1. **Cloudinary** (free tier) - Images in 30 seconds
  2. **AWS S3** - Full file storage
  3. **Firebase Storage** - Google's solution
  4. Disable file uploads temporarily

### **Free Tier Limitations**
- Spins down after 15 min inactivity
- First request takes ~30 sec
- **Solution:** Upgrade to Starter plan ($7/mo)

### **Keep-Alive (Optional)**
Add a cron job to ping your backend every 10 min:
- Use [Uptime Robot](https://uptimerobot.com) (free)
- Configure to `GET https://your-backend.onrender.com/api/health`

---

## 🎯 Next Steps

1. ✅ Deploy backend on Render
2. 📱 Deploy frontend (same process)
3. 🔗 Link frontend to backend API
4. 🐍 Deploy Python ML backend (separate service)
5. 🧪 Run full integration tests

---

## 🆘 Troubleshooting

### **"Build failed"**
- Check logs: Render Dashboard → Logs
- Common: Missing env variables or npm install issues
- Solution: Verify all required env vars are set

### **"Cannot connect to MongoDB"**
- Check connection string spelling
- Verify IP whitelist (0.0.0.0/0)
- Test locally with same connection string

### **"Port already in use"**
- Render auto-assigns ports
- Don't hard-code PORT values
- Use: `process.env.PORT` ✅

### **"Timeouts on first request"**
- Normal on free tier (container spinup)
- Upgrade to Starter plan to eliminate

---

## 📝 Files Changed

- ✅ `backend/.gitignore` - New file
- ✅ `backend/package.json` - Updated build script
- ✅ `backend/server.js` - Enhanced error handling
- ✅ `backend/config/env.js` - Production CORS config
- ✅ `backend/.env.example` - Updated documentation
- ✅ `backend/services/uploadService.js` - New file
- ✅ `backend/Procfile` - New file
- ✅ `render.yaml` - New file

---

**Your backend is now deployment-ready! 🚀**
