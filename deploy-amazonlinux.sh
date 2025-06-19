#!/bin/bash

# EvyRoad Production Deployment Script - Amazon Linux 2023
# This script deploys the React frontend and Node.js backend to an Amazon Linux EC2 instance

set -e  # Exit on any error

# Configuration
SERVER_IP="34.202.160.77"
SERVER_USER="ec2-user"
SSH_KEY="/Users/ssoward/.ssh/evyroad.pem"
LOCAL_DIR="/Users/ssoward/sandbox/workspace/evyroad"
REMOTE_DIR="/var/www/evyroad"

echo "🚀 Starting EvyRoad Production Deployment..."
echo "Server: $SERVER_IP"
echo "Local directory: $LOCAL_DIR"

# Build applications
echo "📦 Building production bundles..."

# Build backend
echo "Building backend..."
cd "$LOCAL_DIR/evyroad-backend"
npm install --production=false
npm run build

# Build frontend
echo "Building frontend..."
cd "$LOCAL_DIR/evyroad-frontend"
npm install --production=false
npm run build

# Deploy to server
echo "🔄 Deploying to server..."

# Install required packages on Amazon Linux
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
# Update system
sudo dnf update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18

# Install PM2 globally
npm install -g pm2

# Install Nginx
sudo dnf install -y nginx

# Create web directory
sudo mkdir -p /var/www/evyroad/backend
sudo mkdir -p /var/www/evyroad/frontend
sudo chown -R ec2-user:ec2-user /var/www/evyroad
EOF

# Upload backend files
echo "📤 Uploading backend files..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  "$LOCAL_DIR/evyroad-backend/dist/" \
  "$LOCAL_DIR/evyroad-backend/package.json" \
  "$LOCAL_DIR/evyroad-backend/package-lock.json" \
  "$LOCAL_DIR/evyroad-backend/.env.production" \
  "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/backend/"

# Upload frontend build
echo "📤 Uploading frontend build..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  "$LOCAL_DIR/evyroad-frontend/dist/" \
  "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/frontend/"

# Upload frontend environment file
scp -i "$SSH_KEY" "$LOCAL_DIR/evyroad-frontend/.env.production" \
  "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/frontend/"

# Install backend dependencies and start services
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install backend dependencies
cd /var/www/evyroad/backend
npm install --production

# Copy environment file
cp .env.production .env

# Stop existing PM2 processes
pm2 delete evyroad-backend 2>/dev/null || true

# Start backend with PM2
pm2 start server.js --name "evyroad-backend" --watch
pm2 save
pm2 startup
EOF

echo "✅ Backend deployed and started with PM2"

# Configure Nginx
echo "🌐 Configuring Nginx..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
# Create Nginx configuration
sudo tee /etc/nginx/conf.d/evyroad.conf > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name 34.202.160.77;

    # Frontend (React app)
    location / {
        root /var/www/evyroad/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
NGINX_EOF

# Test and restart Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl restart nginx
EOF

echo "✅ Nginx configured and restarted"

# Configure firewall (Amazon Linux uses firewalld)
echo "🔒 Configuring firewall..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
# Configure firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
EOF

echo "✅ Firewall configured"

# Display firewall status
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "sudo firewall-cmd --list-all"

# Check deployment status
echo "📊 Checking deployment status..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
# Load NVM for PM2 commands
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "=== PM2 Status ==="
pm2 status

echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l

echo ""
echo "=== Backend Health Check ==="
curl -f http://localhost:3001/health && echo "Backend is healthy" || echo "Backend health check failed"

echo ""
echo "=== Disk Usage ==="
df -h /
EOF

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://$SERVER_IP"
echo "   Backend API: http://$SERVER_IP/api"
echo "   Health Check: http://$SERVER_IP/health"
echo ""
echo "🔧 Management Commands:"
echo "   SSH to server: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP"
echo "   View logs: pm2 logs evyroad-backend"
echo "   Restart backend: pm2 restart evyroad-backend"
echo "   Check status: pm2 status"
echo ""
echo "📝 Next Steps:"
echo "   1. Update DNS to point to $SERVER_IP (if using custom domain)"
echo "   2. Configure SSL certificate with Let's Encrypt"
echo "   3. Set up monitoring and backup scripts"
echo "   4. Configure production environment variables"
