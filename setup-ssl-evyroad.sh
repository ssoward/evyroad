#!/bin/bash
# SSL Setup Script for EvyRoad Production (Amazon Linux 2)
# Usage: Run this script on your EC2 instance as root or with sudo
# This script will install Certbot, obtain an SSL certificate for evyroad.com, and configure Nginx

DOMAIN=evyroad.com
EMAIL=admin@$DOMAIN  # Change to your real email for renewal notifications

# Install EPEL and Certbot
sudo yum install -y epel-release
sudo yum install -y certbot python3-certbot-nginx

# Allow HTTPS through firewall (if using firewalld)
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Obtain and install SSL certificate
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --redirect --non-interactive

# Test automatic renewal
sudo certbot renew --dry-run

echo "SSL setup complete. Your site should now be available at https://$DOMAIN"
