# EvyRoad Production Deployment Checklist

## Pre-Deployment Checklist

### 🔐 Security Configuration
- [ ] Update JWT secrets in `.env.production` (64+ character random strings)
- [ ] Set strong database passwords
- [ ] Configure Redis authentication
- [ ] Update AWS credentials for production
- [ ] Set production API keys (Stripe, Google Maps, etc.)
- [ ] Review CORS allowed origins

### 🗄️ Database Setup
- [ ] Set up production PostgreSQL database
- [ ] Create database user with appropriate permissions
- [ ] Run database migrations
- [ ] Set up database backups

### 🌐 Infrastructure
- [ ] Ensure EC2 instance has sufficient resources (t3.medium+ recommended)
- [ ] Configure security groups (ports 22, 80, 443)
- [ ] Set up domain name (if using custom domain)
- [ ] Configure DNS records

### 🔧 Server Requirements
- [ ] Ubuntu 20.04+ LTS
- [ ] Node.js 18+
- [ ] Nginx
- [ ] PM2 process manager
- [ ] UFW firewall

## Deployment Steps

1. **Update Configuration Files**
   ```bash
   # Edit production environment files
   nano evyroad-backend/.env.production
   nano evyroad-frontend/.env.production
   ```

2. **Run Deployment Script**
   ```bash
   ./deploy-production.sh
   ```

3. **Verify Deployment**
   ```bash
   # SSH to server
   ssh -i /Users/ssoward/.ssh/evyroad.pem ubuntu@34.202.160.77
   
   # Check services
   pm2 status
   sudo systemctl status nginx
   curl http://localhost:3001/health
   ```

## Post-Deployment Checklist

### 🔍 Verification
- [ ] Frontend loads at http://34.202.160.77
- [ ] API endpoints respond at http://34.202.160.77/api
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes work properly
- [ ] Health check endpoint responds

### 🛡️ Security Hardening
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure HTTPS redirects
- [ ] Enable HTTP/2
- [ ] Set up fail2ban for SSH protection
- [ ] Configure automatic security updates

### 📊 Monitoring
- [ ] Set up log rotation
- [ ] Configure error monitoring (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure backup scripts
- [ ] Set up database monitoring

### 🚀 Performance
- [ ] Enable Nginx gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure cache headers
- [ ] Monitor application performance

## SSL Certificate Setup (Recommended)

```bash
# SSH to server
ssh -i /Users/ssoward/.ssh/evyroad.pem ubuntu@34.202.160.77

# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Maintenance Commands

```bash
# SSH to server
ssh -i /Users/ssoward/.ssh/evyroad.pem ubuntu@34.202.160.77

# View application logs
pm2 logs evyroad-backend

# Restart application
pm2 restart evyroad-backend

# View system logs
sudo journalctl -u nginx -f

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop
```

## Backup Strategy

### Database Backup
```bash
# Create backup script
sudo tee /etc/cron.daily/evyroad-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/evyroad"
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U evyroad_user evyroad_prod > $BACKUP_DIR/evyroad_$(date +%Y%m%d_%H%M%S).sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

sudo chmod +x /etc/cron.daily/evyroad-backup
```

### File System Backup
```bash
# Backup application files
rsync -avz /var/www/evyroad/ /var/backups/evyroad-files/
```

## Troubleshooting

### Common Issues

1. **Backend not starting**
   ```bash
   pm2 logs evyroad-backend
   cd /var/www/evyroad/backend && npm start
   ```

2. **Frontend not loading**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Database connection issues**
   ```bash
   sudo -u postgres psql
   \l  # List databases
   \du # List users
   ```

4. **Permission issues**
   ```bash
   sudo chown -R ubuntu:ubuntu /var/www/evyroad
   ```

## Emergency Contacts

- **Technical Lead**: [Your contact information]
- **Infrastructure**: [AWS Support/DevOps contact]
- **Database**: [Database administrator contact]
