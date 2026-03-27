# Easypanel Setup Guide

## 🎯 Prerequisites

- VPS with Ubuntu 20.04 or later
- Domain name (optional, for HTTPS)
- Easypanel installed on VPS

## 📦 Step 1: Install Easypanel

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Install Easypanel
curl -sSL https://get.easypanel.io | sh

# After installation, access Easypanel at:
# http://your-vps-ip:3000
```

## 🔐 Step 2: Login to Easypanel

1. Open `http://your-vps-ip:3000` in your browser
2. Create your admin account
3. Login with your credentials

## 🏗️ Step 3: Add Docker Image

### Option A: Use Pre-built Image (Recommended)

1. Go to "Services" → "Create Service"
2. Select "Custom Service"
3. Configure:
   - **Name**: `atus-dashboard`
   - **Image**: `ghcr.io/guilhermegiorgi/atus-dashboard:latest`
   - **Port**: `3000`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `PORT=3000`
4. Click "Create"

### Option B: Build from Git

1. Go to "Services" → "Create Service"
2. Select "From Git"
3. Configure:
   - **Git Repository**: `https://github.com/guilhermegiorgi/atus-dashboard.git`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`
4. Click "Create"

## 🌐 Step 4: Add Domain (Optional)

1. Go to "Domains"
2. Click "Add Domain"
3. Configure:
   - **Domain**: `dashboard.seusite.com`
   - **Service**: Select `atus-dashboard`
   - **Port**: `3000`
   - **SSL**: Enable (Let's Encrypt)
4. Click "Create"

## 🔄 Step 5: Configure Auto-Deploy

To automatically deploy when you push to GitHub:

1. Go to "Services" → Select `atus-dashboard`
2. Click "Settings"
3. Enable "Auto Deploy"
4. Configure:
   - **Branch**: `main`
5. Save

## ✅ Step 6: Verify Deployment

1. Go to "Services" → Select `atus-dashboard`
2. Check status: Should be "Running"
3. Click "Open" to access your dashboard
4. Or access directly: `http://your-vps-ip:3000`

## 🛠️ Troubleshooting

### Service won't start

```bash
# Check logs in Easypanel
# Or SSH into VPS and check:
docker logs atus-dashboard

# Restart service
docker restart atus-dashboard
```

### Port already in use

Change the port in Easypanel service settings:
- Edit service → Port → Change to another port (e.g., `3001`)

### SSL certificate issues

1. Make sure domain DNS points to your VPS
2. Wait 5-10 minutes for DNS propagation
3. Try regenerating certificate in Easypanel

### Update the application

Option 1: Auto-deploy (push to GitHub)
```bash
git push origin main
```

Option 2: Manual update in Easypanel
1. Go to service → Settings
2. Click "Pull latest image"
3. Click "Restart"

## 📊 Monitoring

Easypanel provides:
- **Resource usage**: CPU, Memory, Disk
- **Logs**: View service logs
- **Backups**: Automated backups
- **SSL**: Automatic certificate renewal

## 🔐 Security Tips

1. **Use a strong password** for Easypanel admin
2. **Enable SSL** (HTTPS) for your domain
3. **Keep Easypanel updated**
4. **Configure firewall** to restrict access
5. **Regular backups** of your data

## 🎉 You're done!

Your Atus Dashboard is now live and accessible!

- **Local**: `http://your-vps-ip:3000`
- **Domain**: `https://dashboard.seusite.com` (if configured)