#!/bin/bash

# EvyRoad Update Deployment Script
# Use this to deploy updates without full server setup

set -e

SERVER_IP="34.202.160.77"
SERVER_USER="ec2-user"
SSH_KEY="/Users/ssoward/.ssh/evyroad.pem"
LOCAL_DIR="/Users/ssoward/sandbox/workspace/evyroad"

echo "🔄 Deploying EvyRoad Updates..."

# Build frontend
echo "📦 Building frontend..."
cd "$LOCAL_DIR/evyroad-frontend"
npm run build

# Build backend
echo "📦 Building backend..."
cd "$LOCAL_DIR/evyroad-backend"
npm run build

# Upload frontend
echo "📤 Uploading frontend..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  "$LOCAL_DIR/evyroad-frontend/dist/" \
  "$SERVER_USER@$SERVER_IP:/var/www/evyroad/frontend/"

# Upload backend
echo "📤 Uploading backend..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  "$LOCAL_DIR/evyroad-backend/dist/" \
  "$SERVER_USER@$SERVER_IP:/var/www/evyroad/backend/"

# Restart backend
echo "🔄 Restarting backend..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /var/www/evyroad/backend
pm2 restart evyroad-backend
EOF

echo "✅ Deployment completed!"
echo "🌐 Check: http://$SERVER_IP"
