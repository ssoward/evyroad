#!/bin/bash
# setup-redis-production.sh
# Install and configure Redis for EvyRoad production

set -e

echo "Setting up Redis for EvyRoad production..."

# Generate a strong Redis password
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
echo "Generated Redis password: $REDIS_PASSWORD"

# Install Redis
sudo yum update -y
sudo yum install -y redis6

# Configure Redis
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Create Redis configuration
sudo tee /etc/redis/redis.conf << EOF
# Redis production configuration for EvyRoad
bind 127.0.0.1
port 6379
timeout 300
tcp-keepalive 300

# Security
requirepass $REDIS_PASSWORD
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
EOF

# Set correct permissions
sudo chown redis:redis /etc/redis/redis.conf
sudo chmod 640 /etc/redis/redis.conf

# Start and enable Redis
sudo systemctl start redis
sudo systemctl enable redis

echo "Redis setup complete!"
echo "Redis password: $REDIS_PASSWORD"
echo ""
echo "Please update your backend .env.production file with:"
echo "REDIS_HOST=localhost"
echo "REDIS_PORT=6379"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo "REDIS_DB=0"
