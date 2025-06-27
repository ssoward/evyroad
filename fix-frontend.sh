#!/bin/bash

# Quick Frontend Fix Script
# Rebuilds and redeploys the frontend with correct environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 EvyRoad Frontend Fix & Redeploy${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Load deployment configuration
source deploy-config.sh

# Change to frontend directory
cd evyroad-frontend

echo -e "${YELLOW}📋 Current environment configuration:${NC}"
cat .env.production

echo ""
echo -e "${YELLOW}🔨 Building frontend with production environment...${NC}"

# Install dependencies
npm install

# Build with production environment
npm run build

echo -e "${GREEN}✅ Frontend build completed${NC}"

# Deploy to server
echo -e "${YELLOW}🚀 Deploying to server...${NC}"

# Remove old files
deploy_ssh "sudo rm -rf /var/www/evyroad/frontend/*"

# Copy new build
deploy_rsync "dist/" "/var/www/evyroad/frontend/"

# Fix permissions
deploy_ssh "sudo chown -R nginx:nginx /var/www/evyroad/frontend"
deploy_ssh "sudo find /var/www/evyroad/frontend -type f -exec chmod 644 {} +"
deploy_ssh "sudo find /var/www/evyroad/frontend -type d -exec chmod 755 {} +"

# Reload nginx
deploy_ssh "sudo systemctl reload nginx"

echo -e "${GREEN}✅ Frontend redeployed successfully${NC}"

# Test the frontend
echo -e "${YELLOW}🧪 Testing frontend...${NC}"
website_status=$(curl -s -o /dev/null -w "%{http_code}" "https://evyroad.com" || echo "000")

if [[ "$website_status" == "200" ]]; then
    echo -e "${GREEN}✅ Website is accessible: https://evyroad.com${NC}"
else
    echo -e "${RED}❌ Website returned status: $website_status${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Frontend fix completed!${NC}"
echo -e "${BLUE}🌐 Test the registration at: https://evyroad.com${NC}"
