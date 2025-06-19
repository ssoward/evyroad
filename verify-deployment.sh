#!/bin/bash

# EvyRoad Deployment Verification Script
# This script verifies that the deployment was successful

SERVER_IP="34.202.160.77"
SSH_KEY="/Users/ssoward/.ssh/evyroad.pem"
SERVER_USER="ec2-user"

echo "🔍 EvyRoad Deployment Verification"
echo "=================================="
echo ""

# Test 1: Frontend accessibility
echo "1. Testing Frontend..."
if curl -f -s http://$SERVER_IP/ >/dev/null 2>&1; then
    echo "   ✅ Frontend is accessible at http://$SERVER_IP"
else
    echo "   ❌ Frontend is not accessible"
fi

# Test 2: Health check
echo "2. Testing Health Check..."
HEALTH_RESPONSE=$(curl -s http://$SERVER_IP/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"'; then
    echo "   ✅ Health check passed: $HEALTH_RESPONSE"
else
    echo "   ❌ Health check failed"
fi

# Test 3: API endpoints
echo "3. Testing API Endpoints..."
API_RESPONSE=$(curl -s http://$SERVER_IP/api/v1/auth/register -X POST -H "Content-Type: application/json" -d '{"email":"test-'$(date +%s)'@example.com","password":"testpass123","firstName":"Test","lastName":"User"}')
if echo "$API_RESPONSE" | grep -q '"message":"User registered successfully"'; then
    echo "   ✅ API registration endpoint working"
else
    echo "   ❌ API registration endpoint failed"
    echo "   Response: $API_RESPONSE"
fi

# Test 4: Backend service status
echo "4. Checking Backend Service..."
BACKEND_STATUS=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"; pm2 jlist' 2>/dev/null)
if echo "$BACKEND_STATUS" | grep -q '"name":"evyroad-backend"'; then
    echo "   ✅ Backend service is running with PM2"
else
    echo "   ❌ Backend service check failed"
fi

# Test 5: Nginx status
echo "5. Checking Nginx Service..."
NGINX_STATUS=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" 'sudo systemctl is-active nginx' 2>/dev/null)
if [ "$NGINX_STATUS" = "active" ]; then
    echo "   ✅ Nginx is active and running"
else
    echo "   ❌ Nginx is not running properly"
fi

echo ""
echo "🎯 Deployment Summary"
echo "===================="
echo "Frontend URL: http://$SERVER_IP"
echo "API Base URL: http://$SERVER_IP/api/v1"
echo "Health Check: http://$SERVER_IP/health"
echo ""
echo "📱 Test the application by visiting: http://$SERVER_IP"
echo ""
echo "🔧 Management Commands:"
echo "SSH to server: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP"
echo "View backend logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'export NVM_DIR=\"\$HOME/.nvm\"; [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"; pm2 logs evyroad-backend'"
echo "Restart backend: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'export NVM_DIR=\"\$HOME/.nvm\"; [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"; pm2 restart evyroad-backend'"
echo "Check PM2 status: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'export NVM_DIR=\"\$HOME/.nvm\"; [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"; pm2 status'"
