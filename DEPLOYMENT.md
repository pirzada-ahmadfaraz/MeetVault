# 🚀 Video Conference App Deployment Guide

## 📋 Deployment Architecture

```
Frontend (Vercel) ↔ Backend (Railway) ↔ Database (MongoDB Atlas)
```

## 🗄️ Step 1: Setup MongoDB Atlas (FREE)

1. **Go to [MongoDB Atlas](https://cloud.mongodb.com/)**
2. **Create account** and new project
3. **Create Cluster** (FREE M0 tier)
4. **Create Database User:**
   - Username: `videoconf-user`
   - Password: `[Generate Strong Password]`
5. **Network Access:** Add `0.0.0.0/0` (Allow from anywhere)
6. **Get Connection String:**
   ```
   mongodb+srv://videoconf-user:<password>@cluster0.xxxxx.mongodb.net/video-conference-app
   ```

## 🚢 Step 2: Deploy Backend to Railway (FREE $5 Credit)

1. **Go to [Railway.app](https://railway.app/)**
2. **Connect GitHub account**
3. **Create new project** → "Deploy from GitHub repo"
4. **Select your video conference repo**
5. **Set Root Directory:** `/` (main folder, not frontend)
6. **Environment Variables:**
   ```bash
   PORT=8000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://videoconf-user:<password>@cluster0.xxxxx.mongodb.net/video-conference-app
   JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random-123456789
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-app-name.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```
7. **Deploy!** Railway will give you a URL like: `https://your-app.railway.app`

## 🌐 Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com/)**
2. **Connect GitHub account**
3. **Import your repository**
4. **Set Root Directory:** `frontend`
5. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret-key-here-make-it-secure-123456789
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```
6. **Deploy!** Vercel will give you: `https://your-app-name.vercel.app`

## 🔗 Step 4: Update CORS Configuration

1. **Go back to Railway**
2. **Update environment variables:**
   ```bash
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```
3. **Redeploy backend**

## 🎯 Step 5: Test Your Deployment

Visit your Vercel URL and test:
- ✅ User registration/login
- ✅ Meeting creation
- ✅ Meeting start functionality
- ✅ Meeting joining

## 🛠️ Quick Commands for Local Development

```bash
# Backend (from root directory)
npm install
npm start

# Frontend (from frontend directory)
cd frontend
npm install
npm run dev
```

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Error:**
   - Update `CORS_ORIGIN` in Railway to match your Vercel URL

2. **Database Connection:**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string format

3. **API Not Working:**
   - Ensure `NEXT_PUBLIC_API_URL` points to Railway backend
   - Check Railway logs for errors

## 📊 Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **Vercel** | 100GB bandwidth, Custom domain |
| **Railway** | $5/month credit (~550 hours) |
| **MongoDB Atlas** | 512MB storage, 100 connections |

## 🚀 Going Live Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Railway backend deployed
- [ ] Vercel frontend deployed
- [ ] Environment variables configured
- [ ] CORS properly set
- [ ] Test user registration
- [ ] Test meeting creation
- [ ] Test meeting start/join flow

Your app will be live at: `https://your-app-name.vercel.app` 🎉