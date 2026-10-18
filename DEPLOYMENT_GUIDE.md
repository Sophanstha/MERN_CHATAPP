# MERN ChatApp - Production Deployment Guide

This guide covers everything you need to deploy your real-time MERN chat application with Gemini AI.

---

## 🚀 Recommended Deployment Strategy

- **Backend**: [Render.com](https://render.com) or [Railway.app](https://railway.app) (supports Node.js, WebSockets, background tasks).
- **Frontend**: [Vercel.com](https://vercel.com) or [Render Static Site](https://render.com).
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (already configured).
- **Media Storage**: [Cloudinary](https://cloudinary.com) (already configured).

---

## 📋 Environment Variables Checklist

### 1. Backend Server Environment Variables
Configure these in your backend hosting dashboard (e.g. Render/Railway):

| Variable | Description | Example Value |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Web server port (auto-set by Render) | `3000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.mongodb.net` |
| `DB_NAME` | MongoDB database name | `chatApp` |
| `JWT_SECRET` | Secret key for signing auth tokens | `your_long_random_secret_string` |
| `FRONTEND_URL` | Deployed frontend domain (for CORS & WebSockets) | `https://your-chatapp.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini API key from Google AI Studio | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini AI model version | `gemini-2.5-flash` |

---

### 2. Frontend Client Environment Variables
Configure these in your frontend hosting dashboard (e.g. Vercel):

| Variable | Description | Example Value |
|---|---|---|
| `VITE_BACKEND_URL` | Deployed backend URL (without trailing slash) | `https://your-backend.onrender.com` |
| `REACT_CLOUDINARY_CLOUND_NAME` | Cloudinary cloud name for media uploads | `dba000dkc` |

---

## 🛠️ Step-by-Step Deployment

### Part 1: Deploy Backend on Render

1. Create a free account on [Render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository.
4. Fill in the settings:
   - **Name**: `chatapp-server`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** &rarr; **Add Environment Variable** and enter all the **Backend Server Environment Variables** listed above.
6. Click **Create Web Service**.
7. Note down your backend URL once deployed (e.g., `https://chatapp-server.onrender.com`).

---

### Part 2: Deploy Frontend on Vercel

1. Create a free account on [Vercel.com](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Import your GitHub repository.
4. In **Project Settings**:
   - **Root Directory**: Click edit and select `client`.
   - **Framework Preset**: `Vite`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - `VITE_BACKEND_URL`: Set to your Render backend URL (e.g., `https://chatapp-server.onrender.com`).
   - `REACT_CLOUDINARY_CLOUND_NAME`: `dba000dkc`
6. Click **Deploy**.
7. Copy your deployed frontend URL (e.g., `https://chatapp.vercel.app`).

---

### Part 3: Connect Frontend URL to Backend

1. Go back to your **Render** backend dashboard.
2. Under **Environment Variables**, update `FRONTEND_URL` with your actual Vercel URL (e.g., `https://chatapp.vercel.app`).
3. Render will automatically redeploy with the updated CORS origin allowed.

---

## 🩺 Production Healthcheck

Your backend includes an automated healthcheck route:
- Endpoint: `https://your-backend.onrender.com/api/health`
- Response: `{"status": "healthy", "timestamp": "..."}`
