# SOC SIEM Dashboard — Complete Deployment Guide

> **Goal**: Make the dashboard publicly accessible on the internet so real events from any machine push to a live URL.

---

## Architecture After Deployment

```
Your Windows PC                    Cloud (Free Tier)
───────────────                    ──────────────────────────────────
windows-event-agent.ps1 ─HTTPS──▶ Render (Node.js backend) ──▶ MongoDB Atlas
                                         │
                                   Socket.IO ─▶ Vercel (React frontend) ──▶ Browser
```

**Estimated cost: $0/month** (all free tiers)

---

## Step 1 — MongoDB Atlas (Free Cloud Database)

1. Go to **https://mongodb.com/atlas** → Create account → Create free cluster
2. Choose **M0 Free** → Region: **Mumbai (ap-south-1)**
3. Create a database user: username + strong password
4. Network Access → **Allow from anywhere** → `0.0.0.0/0`
5. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/soc_siem?retryWrites=true&w=majority
   ```
6. **Save this URI** — you'll paste it into Render in the next step

---

## Step 2 — Deploy Backend to Render (Free)

1. Push your project to **GitHub** (if not already):
   ```powershell
   cd "d:\Last Sem Project\soc-siem-dashboard"
   git init
   git add .
   git commit -m "Initial deployment"
   # Create a repo on github.com, then:
   git remote add origin https://github.com/YOUR-USERNAME/soc-siem-dashboard.git
   git push -u origin main
   ```

2. Go to **https://render.com** → Sign up with GitHub → **New → Web Service**

3. Connect your GitHub repo → Select **soc-siem-dashboard**

4. Configure:
   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Region | Singapore |
   | Plan | Free |

5. Add **Environment Variables** (click "Add Environment Variable" for each):
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | *(paste Atlas URI from Step 1)* |
   | `JWT_SECRET` | *(run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)* |
   | `REFRESH_SECRET` | *(run same command again — different value)* |
   | `INGEST_API_KEY` | *(run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)* |
   | `ACCESS_TOKEN_EXPIRY` | `15m` |
   | `REFRESH_TOKEN_EXPIRY` | `7d` |
   | `CORS_ORIGIN` | *(set after Vercel deployment — come back to this)* |

6. Click **Deploy** → Wait ~3 minutes

7. You'll get a URL like: `https://soc-siem-backend.onrender.com`
   - Test it: `https://soc-siem-backend.onrender.com/health`

---

## Step 3 — Re-seed the Cloud Database

```powershell
# In your local backend/.env temporarily change MONGO_URI to Atlas URI, then:
cd "d:\Last Sem Project\soc-siem-dashboard\backend"
node seed.js
# Then restore your local MONGO_URI
```

---

## Step 4 — Deploy Frontend to Vercel

1. Update `frontend/.env.production` with your Render URL:
   ```
   VITE_API_BASE_URL=https://soc-siem-backend.onrender.com/api
   VITE_SOCKET_URL=https://soc-siem-backend.onrender.com
   ```

2. Go to **https://vercel.com** → Sign up with GitHub → **New Project**

3. Import your GitHub repo → Configure:
   | Setting | Value |
   |---|---|
   | Framework | Vite |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. Click **Deploy** → You'll get a URL like: `https://soc-siem-dashboard.vercel.app`

---

## Step 5 — Connect Backend ↔ Frontend (CORS)

Go back to **Render** → Your service → **Environment** → Add:
```
CORS_ORIGIN = https://soc-siem-dashboard.vercel.app
```
Click **Save** → Render auto-redeploys.

---

## Step 6 — Update Windows Agent for Production

Edit `scripts/windows-event-agent.ps1` — change the CONFIG section:
```powershell
$INGEST_URL = "https://soc-siem-backend.onrender.com"   # ← your Render URL
$API_KEY    = "YOUR_PRODUCTION_INGEST_API_KEY"           # ← from Render env vars
```

Run as Administrator:
```powershell
cd "d:\Last Sem Project\soc-siem-dashboard\scripts"
.\windows-event-agent.ps1
```

Now real Windows security events appear on your **live public dashboard** in real-time!

---

## Trigger a Real Event to Test End-to-End

```powershell
# From your home PC — causes EventID 4625 (failed login)
net use \\localhost\C$ /user:hackertest wrongpassword

# OR push manually to the live URL
Invoke-RestMethod `
  -Uri "https://soc-siem-backend.onrender.com/api/ingest/alert" `
  -Method POST `
  -Headers @{"X-API-Key"="YOUR_PRODUCTION_INGEST_API_KEY"; "Content-Type"="application/json"} `
  -Body '{"title":"Live Test Attack","severity":"HIGH","ipAddress":"185.220.101.47"}'
```

Open `https://soc-siem-dashboard.vercel.app` — the alert appears on the map in real-time! 🎯

---

## Free Tier Limits

| Service | Free Tier Limit |
|---|---|
| Render | 750 hrs/month, sleeps after 15min inactivity |
| MongoDB Atlas | 512MB storage |
| Vercel | Unlimited static hosting |

> **Tip**: Render free tier sleeps after 15 minutes of no HTTP requests. First request after sleep takes ~30s to wake up. Upgrade to $7/month Starter plan to keep it always awake.
