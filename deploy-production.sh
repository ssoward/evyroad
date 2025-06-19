#!/bin/bash

# EvyRoad Production Deployment Script
# Deploy to EC2 server: 34.202.160.77

set -e  # Exit on any error

# Configuration
SERVER_IP="34.202.160.77"
SSH_KEY="/Users/ssoward/.ssh/evyroad.pem"
SERVER_USER="ec2-user"  # Default for Ubuntu AMI
REMOTE_DIR="/var/www/evyroad"
LOCAL_DIR="$(pwd)"

echo "🚀 Starting EvyRoad Production Deployment..."
echo "Server: $SERVER_IP"
echo "Local directory: $LOCAL_DIR"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at $SSH_KEY"
    exit 1
fi

# Set correct permissions for SSH key
chmod 600 "$SSH_KEY"

echo "📦 Building production bundles..."

# Build backend
echo "Building backend..."
cd evyroad-backend
npm ci --production=false
npm run build
cd ..

# Build frontend
echo "Building frontend..."
cd evyroad-frontend
# Copy production environment
cp .env.production .env
npm ci --production=false
npm run build
cd ..

echo "🔄 Deploying to server..."

# Create deployment directory structure on server
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
    # Update system packages
    sudo apt update
    
    # Install Node.js 18 if not installed
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2 globally if not installed
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi
    
    # Install nginx if not installed
    if ! command -v nginx &> /dev/null; then
        sudo apt-get install -y nginx
    fi
    
    # Create application directory
    sudo mkdir -p /var/www/evyroad
    sudo chown -R $USER:$USER /var/www/evyroad
    
    # Create logs directory
    mkdir -p /var/www/evyroad/logs
EOF

# Copy backend files
echo "📤 Uploading backend files..."
rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    --exclude="node_modules" \
    --exclude="coverage" \
    --exclude="*.log" \
    --exclude=".env" \
    evyroad-backend/ "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/backend/"

# Copy frontend build
echo "📤 Uploading frontend build..."
rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    evyroad-frontend/dist/ "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/frontend/"

# Copy environment files
echo "📤 Uploading configuration files..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    evyroad-backend/.env.production "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/backend/.env"

# Setup and start services on server
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << EOF
    cd $REMOTE_DIR/backend
    
    # Install production dependencies
    npm ci --only=production
    
    # Update environment variables for production
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
    sed -i 's/localhost:5173/34.202.160.77/' .env
    
    # Stop existing PM2 processes
    pm2 stop evyroad-backend || true
    pm2 delete evyroad-backend || true
    
    # Start backend with PM2
    pm2 start dist/server.js --name "evyroad-backend" --env production
    pm2 save
    pm2 startup
    
    echo "✅ Backend deployed and started with PM2"
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/evyroad << 'NGINX_CONFIG'
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
NGINX_CONFIG

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/evyroad /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo "✅ Nginx configured and restarted"
EOF

# Setup firewall
echo "🔒 Configuring firewall..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
    # Configure UFW firewall
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force reload
    
    echo "✅ Firewall configured"
EOF

# Display deployment status
echo "📊 Checking deployment status..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
    echo "=== PM2 Status ==="
    pm2 status
    
    echo ""
    echo "=== Nginx Status ==="
    sudo systemctl status nginx --no-pager -l
    
    echo ""
    echo "=== Backend Health Check ==="
    curl -s http://localhost:3001/health || echo "Backend health check failed"
    
    echo ""
    echo "=== Disk Usage ==="
    df -h /var/www/evyroad
EOF

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://34.202.160.77"
echo "   Backend API: http://34.202.160.77/api"
echo "   Health Check: http://34.202.160.77/health"
echo ""
echo "🔧 Management Commands:"
echo "   SSH to server: ssh -i $SSH_KEY ubuntu@34.202.160.77"
echo "   View logs: pm2 logs evyroad-backend"
echo "   Restart backend: pm2 restart evyroad-backend"
echo "   Check status: pm2 status"
echo ""
echo "📝 Next Steps:"
echo "   1. Update DNS to point to 34.202.160.77 (if using custom domain)"
echo "   2. Configure SSL certificate with Let's Encrypt"
echo "   3. Set up monitoring and backup scripts"
echo "   4. Configure production environment variables"
