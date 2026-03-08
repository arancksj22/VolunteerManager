# 🚀 Simple Deployment Guide

Deploy your VolunteerManager backend in under 5 minutes with **Railway** (recommended) or **Render**.

## ✨ Why This Is Simple

- ✅ **No Docker needed**: Just push Python code
- ✅ **No AWS/Lambda complexity**: Standard Python server
- ✅ **No model download**: Uses HuggingFace API externally
- ✅ **Free tier available**: Railway $5/month credit, Render free tier
- ✅ **Auto-deploy from Git**: Push code, auto-deploy

---

## 🚂 Option 1: Railway (RECOMMENDED)

**Why Railway?** Free $5/month credit, fastest setup, excellent developer experience

### Step-by-Step

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (easiest)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repo (authenticate GitHub if needed)

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project → Variables
   - Add these:
     ```
     SUPABASE_URL=your-supabase-url
     SUPABASE_KEY=your-anon-key
     HUGGINGFACE_API_KEY=your-hf-key (optional)
     ```

4. **Deploy!**
   - Railway auto-detects Python
   - It will run: `pip install -r requirements.txt`
   - Then start with: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Deploy complete!** Railway gives you a public URL

5. **Test Your API**
   - Visit: `https://your-app.railway.app/docs`
   - You'll see the interactive API documentation

### Railway Configuration (Optional)

If Railway doesn't auto-detect correctly, add a `Procfile`:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Or add a `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

---

## 🎨 Option 2: Render

**Why Render?** True free tier (Railway needs credit card), also excellent

### Step-by-Step

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect your GitHub repo
   - Select the repo

3. **Configure Service**
   - **Name**: volunteer-manager-backend
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: (leave blank or specify if Backend is in subfolder)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**
   - Click "Environment" tab
   - Add:
     ```
     SUPABASE_URL=your-supabase-url
     SUPABASE_KEY=your-anon-key
     HUGGINGFACE_API_KEY=your-hf-key (optional)
     ```

5. **Create Web Service**
   - Click "Create Web Service"
   - Render will build and deploy
   - You get a URL like: `https://volunteer-manager-backend.onrender.com`

6. **Test Your API**
   - Visit: `https://volunteer-manager-backend.onrender.com/docs`

### Free Tier Notes

- Render free tier spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- For production, upgrade to $7/month for always-on

---

## 🔧 Option 3: Vercel (Serverless Functions)

**Why Vercel?** Instant deployment, generous free tier, great for Next.js frontend integration

### Step-by-Step

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd Backend
   vercel
   ```

3. **Add Environment Variables**
   - Go to vercel.com → Your project → Settings → Environment Variables
   - Add SUPABASE_URL, SUPABASE_KEY, HUGGINGFACE_API_KEY

4. **Create `vercel.json`** (if needed)
   ```json
   {
     "builds": [
       {
         "src": "app/main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app/main.py"
       }
     ]
   }
   ```

---

## 🐳 Option 4: Traditional VPS (DigitalOcean, Linode, AWS EC2)

If you prefer traditional hosting:

1. **Setup Server**
   ```bash
   # Connect via SSH
   ssh user@your-server-ip

   # Install Python 3.10+
   sudo apt update
   sudo apt install python3.10 python3.10-venv

   # Clone your repo
   git clone your-repo-url
   cd Backend
   ```

2. **Install Dependencies**
   ```bash
   python3.10 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your credentials
   ```

4. **Run with Gunicorn** (production server)
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

5. **Setup Systemd Service** (keeps it running)
   ```bash
   sudo nano /etc/systemd/system/volunteer-manager.service
   ```

   ```ini
   [Unit]
   Description=VolunteerManager Backend
   After=network.target

   [Service]
   Type=simple
   User=youruser
   WorkingDirectory=/path/to/Backend
   Environment="PATH=/path/to/Backend/venv/bin"
   ExecStart=/path/to/Backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable volunteer-manager
   sudo systemctl start volunteer-manager
   ```

6. **Setup Nginx** (reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

---

## 🔐 HuggingFace API Key (Optional)

Your backend works **without** a HuggingFace API key, but has rate limits.

**To get higher limits** (recommended for production):

1. Go to [huggingface.co](https://huggingface.co)
2. Create free account
3. Go to Settings → Access Tokens
4. Create new token (read permissions)
5. Copy token (starts with `hf_...`)
6. Add to environment: `HUGGINGFACE_API_KEY=hf_your_token_here`

**Free tier includes**:
- 30,000 requests/month
- Perfectly fine for low-traffic apps
- No credit card required

---

## 📊 Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Railway** | $5 credit/month | $0.000231/GB-hr | Quick start, dev |
| **Render** | 750 hrs/month (sleeps) | $7/month (always-on) | True free tier |
| **Vercel** | 100GB-hrs + 1000h | $20/month | Serverless, Next.js |
| **VPS** | $0 (self-hosted) | $4-12/month | Full control |

**Recommendation for low traffic**: Render free tier or Railway $5 credit

---

## ✅ Post-Deployment Checklist

- [ ] Visit `/docs` endpoint to verify API is live
- [ ] Test health check: `GET /health`
- [ ] Create test volunteer via `/volunteers` POST
- [ ] Verify Supabase connection working
- [ ] Test embedding generation (should call HuggingFace API)
- [ ] Update frontend `API_BASE_URL` to your deployed URL
- [ ] (Optional) Add custom domain in hosting dashboard

---

## 🐛 Troubleshooting

### "Module not found" error
- Make sure `requirements.txt` is in project root
- Check build logs for pip install errors

### "Connection refused" to Supabase
- Verify SUPABASE_URL and SUPABASE_KEY in environment variables
- Check Supabase project isn't paused

### HuggingFace API timeout
- Normal on first request (model loading)
- Code has automatic retry with exponential backoff
- Consider adding API key for priority queue

### Railway/Render app sleeping
- Free tiers sleep after inactivity
- First request after sleep takes 20-30 seconds
- Upgrade to paid tier for always-on

---

## 🎉 You're Done!

Your backend is now deployed and accessible globally. Update your frontend to use the deployed URL and you're ready to go!

**Next Steps**:
1. Build frontend using `FRONTEND_INTEGRATION_SPEC.md`
2. Set up Supabase Auth in frontend
3. Connect frontend to your deployed backend API
4. Launch! 🚀
