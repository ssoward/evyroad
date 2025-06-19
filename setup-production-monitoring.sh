#!/bin/bash
# production-monitoring.sh
# Comprehensive monitoring, logging, and backup setup for EvyRoad production

set -e

echo "Setting up production monitoring and backups..."

# Install system monitoring tools
sudo yum update -y
sudo yum install -y htop iotop logrotate crontabs

# Set up log rotation for application logs
sudo tee /etc/logrotate.d/evyroad << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    sharedscripts
    postrotate
        /bin/kill -USR1 \$(cat /run/nginx.pid 2>/dev/null) 2>/dev/null || true
    endscript
}

/home/ec2-user/.pm2/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
}

/var/log/redis/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 redis redis
    postrotate
        /bin/kill -USR1 \$(cat /var/run/redis/redis-server.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
EOF

# Create backup directory
sudo mkdir -p /backup/evyroad
sudo chown ec2-user:ec2-user /backup/evyroad

# Create database backup script
tee /home/ec2-user/backup-database.sh << 'EOF'
#!/bin/bash
# Database backup script for EvyRoad

BACKUP_DIR="/backup/evyroad"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="evyroad_prod"
DB_USER="evyroad_user"

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/evyroad_db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/evyroad_db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "evyroad_db_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: evyroad_db_$DATE.sql.gz"
EOF

chmod +x /home/ec2-user/backup-database.sh

# Create system monitoring script
tee /home/ec2-user/system-monitor.sh << 'EOF'
#!/bin/bash
# System monitoring script for EvyRoad

LOG_FILE="/var/log/evyroad-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log() {
    echo "[$DATE] $1" | sudo tee -a $LOG_FILE
}

# Check disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    log "WARNING: Disk usage is at ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -gt 85 ]; then
    log "WARNING: Memory usage is at ${MEMORY_USAGE}%"
fi

# Check if services are running
if ! systemctl is-active --quiet nginx; then
    log "ERROR: Nginx is not running"
fi

if ! systemctl is-active --quiet postgresql; then
    log "ERROR: PostgreSQL is not running"
fi

if ! systemctl is-active --quiet redis; then
    log "ERROR: Redis is not running"
fi

# Check PM2 processes
if ! pm2 list | grep -q "evyroad-backend.*online"; then
    log "ERROR: EvyRoad backend is not running"
fi

# Check SSL certificate expiration
CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/evyroad.com/cert.pem | cut -d= -f2)
EXPIRY_DATE=$(date -d "$CERT_EXPIRY" +%s)
CURRENT_DATE=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
    log "WARNING: SSL certificate expires in $DAYS_LEFT days"
fi

log "System check completed - Disk: ${DISK_USAGE}%, Memory: ${MEMORY_USAGE}%, SSL expires in $DAYS_LEFT days"
EOF

chmod +x /home/ec2-user/system-monitor.sh

# Set up cron jobs
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/backup-database.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/15 * * * * /home/ec2-user/system-monitor.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 certbot renew --quiet") | crontab -

# Enable and start cron service
sudo systemctl enable crond
sudo systemctl start crond

# Create log file for monitoring
sudo touch /var/log/evyroad-monitor.log
sudo chown ec2-user:ec2-user /var/log/evyroad-monitor.log

echo "Production monitoring setup complete!"
echo "✅ Log rotation configured for Nginx, PM2, and Redis"
echo "✅ Database backup script installed (runs daily at 2 AM)"
echo "✅ System monitoring script installed (runs every 15 minutes)"
echo "✅ SSL certificate auto-renewal configured (weekly check)"
echo "✅ Monitoring log: /var/log/evyroad-monitor.log"
echo "✅ Backup directory: /backup/evyroad"
