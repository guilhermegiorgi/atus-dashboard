# Atus Dashboard - Easypanel Deployment

## 📋 Overview

Dashboard de Leads da Átus - Next.js 14 + Shadcn UI

## 🚀 Quick Start

### Option 1: Easypanel (Recommended)

1. **Connect your VPS to Easypanel**
   - Install Easypanel on your VPS: `curl -sSL https://get.easypanel.io | sh`
   - Access Easypanel dashboard: `http://your-vps-ip:3000`

2. **Add Project in Easypanel**
   - Create a new project
   - Select "Custom Service"
   - Set Image: `ghcr.io/guilhermegiorgi/atus-dashboard:latest`
   - Port: `3000`
   - Click "Create"

3. **Add Domain (Optional)**
   - Go to "Domains" in Easypanel
   - Add your domain
   - Select the dashboard service
   - Enable SSL (Let's Encrypt)

### Option 2: Docker Compose

```bash
# Clone the repository
git clone https://github.com/guilhermegiorgi/atus-dashboard.git
cd atus-dashboard

# Run with docker-compose
docker-compose up -d
```

### Option 3: Manual Docker

```bash
# Pull the image
docker pull ghcr.io/guilhermegiorgi/atus-dashboard:latest

# Run the container
docker run -d \
  --name atus-dashboard \
  -p 3000:3000 \
  --restart unless-stopped \
  ghcr.io/guilhermegiorgi/atus-dashboard:latest
```

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Environment (default: `production`)
- `PORT` - Port to run on (default: `3000`)

### Building from Source

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run locally
npm start
```

## 📝 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

For support, email sophia@ggailabs.com or open an issue in the repository.