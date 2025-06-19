#!/bin/bash
# fix-frontend-permissions.sh
# Fix frontend file permissions after deployment

echo "🔧 Fixing frontend file permissions..."

# Set correct ownership
sudo chown -R nginx:nginx /var/www/evyroad/frontend/

# Set correct permissions
sudo find /var/www/evyroad/frontend/ -type f -exec chmod 644 {} \;
sudo find /var/www/evyroad/frontend/ -type d -exec chmod 755 {} \;

echo "✅ Frontend permissions fixed!"
echo "Files: 644 (rw-r--r--)"
echo "Directories: 755 (rwxr-xr-x)"
echo "Owner: nginx:nginx"
