# EvyRoad Deployment Guide

This guide covers deploying the EvyRoad application to AWS with separated frontend and backend services.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   Frontend      │    │   Backend API   │
│   (CDN)         │    │   (S3/EC2)      │    │   (EC2)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
         │   PostgreSQL    │    │   Redis Cache   │    │   S3 Storage    │
         │   (RDS)         │    │   (ElastiCache) │    │   (Photos)      │
         └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Domain name (optional but recommended)
- SSL Certificate (via ACM)

## Backend Deployment

### 1. EC2 Instance Setup

#### Launch EC2 Instance
```bash
# Create security group
aws ec2 create-security-group \
  --group-name evyroad-backend \
  --description "EvyRoad Backend API Security Group"

# Add inbound rules
aws ec2 authorize-security-group-ingress \
  --group-name evyroad-backend \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name evyroad-backend \
  --protocol tcp \
  --port 3001 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name evyroad-backend \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name evyroad-backend \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

#### Launch Instance
```bash
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-groups evyroad-backend \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=EvyRoad-Backend}]'
```

### 2. Server Configuration

#### Connect to Instance
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

#### Install Dependencies
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2 for process management
npm install -g pm2

# Install Git
sudo yum install git -y

# Install PostgreSQL client (if needed)
sudo yum install postgresql -y
```

#### Clone and Setup Application
```bash
# Clone repository
git clone https://github.com/your-username/evyroad.git
cd evyroad/evyroad-backend

# Install dependencies
npm install

# Build application
npm run build

# Copy environment file
cp .env.example .env
# Edit .env with production values
nano .env
```

#### Environment Configuration
```env
NODE_ENV=production
PORT=3001
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_NAME=evyroad_prod
DB_USER=evyroad_user
DB_PASSWORD=secure_password
JWT_SECRET=your_production_jwt_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=evyroad-photos-prod
STRIPE_SECRET_KEY=your_stripe_secret
FRONTEND_URL=https://app.evyroad.com
```

#### Start Application
```bash
# Start with PM2
pm2 start dist/server.js --name "evyroad-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Database Setup (RDS)

#### Create RDS Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier evyroad-database \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 13.7 \
  --allocated-storage 20 \
  --storage-type gp2 \
  --db-name evyroad_prod \
  --master-username evyroad_user \
  --master-user-password SecurePassword123 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

#### Run Migrations
```bash
# On your EC2 instance
cd /home/ec2-user/evyroad/evyroad-backend
npm run migrate
```

### 4. Redis Setup (ElastiCache)

#### Create Redis Cluster
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id evyroad-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-parameter-group default.redis7 \
  --security-group-ids sg-xxxxxxxxx
```

## Frontend Deployment

### Option A: S3 + CloudFront (Recommended)

#### 1. Create S3 Bucket
```bash
aws s3 mb s3://evyroad-frontend-prod
```

#### 2. Configure Bucket for Static Hosting
```bash
# Create bucket policy
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::evyroad-frontend-prod/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket evyroad-frontend-prod \
  --policy file://bucket-policy.json

# Enable static website hosting
aws s3 website s3://evyroad-frontend-prod \
  --index-document index.html \
  --error-document index.html
```

#### 3. Build and Deploy Frontend
```bash
# Local development machine
cd evyroad-frontend

# Set production environment variables
echo "VITE_API_URL=https://api.evyroad.com/api/v1" > .env.production

# Build for production
npm run build

# Deploy to S3
aws s3 sync dist/ s3://evyroad-frontend-prod --delete
```

#### 4. Create CloudFront Distribution
```bash
# Create distribution configuration
cat > cloudfront-config.json << EOF
{
  "CallerReference": "evyroad-$(date +%s)",
  "Comment": "EvyRoad Frontend Distribution",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-evyroad-frontend-prod",
        "DomainName": "evyroad-frontend-prod.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-evyroad-frontend-prod",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### Option B: EC2 Deployment

#### 1. Create Frontend EC2 Instance
```bash
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-groups evyroad-frontend \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=EvyRoad-Frontend}]'
```

#### 2. Setup Nginx
```bash
# Install Nginx
sudo yum install nginx -y

# Configure Nginx
sudo tee /etc/nginx/conf.d/evyroad.conf << EOF
server {
    listen 80;
    server_name app.evyroad.com;
    root /var/www/evyroad;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://your-backend-ip:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 3. Deploy Frontend Code
```bash
# Create web directory
sudo mkdir -p /var/www/evyroad

# Build and copy files
cd evyroad-frontend
npm run build
sudo cp -r dist/* /var/www/evyroad/

# Set permissions
sudo chown -R nginx:nginx /var/www/evyroad
```

## Load Balancing and Auto Scaling

### 1. Create Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name evyroad-alb \
  --subnets subnet-xxxxxxxx subnet-yyyyyyyy \
  --security-groups sg-xxxxxxxxx

# Create target group
aws elbv2 create-target-group \
  --name evyroad-backend-targets \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-xxxxxxxxx \
  --health-check-path /health

# Register targets
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --targets Id=i-xxxxxxxxx,Port=3001
```

### 2. Auto Scaling Configuration
```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name evyroad-backend-template \
  --launch-template-data '{
    "ImageId": "ami-xxxxxxxxx",
    "InstanceType": "t3.small",
    "KeyName": "your-key-pair",
    "SecurityGroupIds": ["sg-xxxxxxxxx"],
    "UserData": "base64-encoded-user-data-script"
  }'

# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name evyroad-backend-asg \
  --launch-template LaunchTemplateName=evyroad-backend-template,Version=1 \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:... \
  --vpc-zone-identifier "subnet-xxxxxxxx,subnet-yyyyyyyy"
```

## SSL Certificate Setup

### 1. Request Certificate via ACM
```bash
aws acm request-certificate \
  --domain-name evyroad.com \
  --subject-alternative-names *.evyroad.com \
  --validation-method DNS
```

### 2. Configure HTTPS
Update your load balancer and CloudFront distribution to use the SSL certificate.

## Monitoring and Logging

### 1. CloudWatch Setup
```bash
# Install CloudWatch agent on EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 2. Application Logs
```bash
# Configure PM2 to send logs to CloudWatch
pm2 install pm2-cloudwatch-logs
pm2 set pm2-cloudwatch-logs:access_key_id your-access-key
pm2 set pm2-cloudwatch-logs:secret_access_key your-secret-key
pm2 set pm2-cloudwatch-logs:region us-east-1
```

## Backup Strategy

### 1. Database Backups
- RDS automatic backups (7-day retention)
- Weekly manual snapshots
- Cross-region backup replication

### 2. File Storage Backups
- S3 versioning enabled
- Cross-region replication
- Lifecycle policies for cost optimization

## Security Hardening

### 1. Network Security
- VPC with private subnets for database
- Security groups with minimal required access
- WAF rules for application protection

### 2. Application Security
- Regular security updates
- Secrets management via AWS Secrets Manager
- IAM roles with least privilege access

## Cost Optimization

### Estimated Monthly Costs
- Frontend (S3 + CloudFront): $10-20
- Backend (t3.small EC2): $20-30
- Database (db.t3.micro RDS): $15-25
- Redis (cache.t3.micro): $15-20
- **Total: $60-95/month**

### Cost Monitoring
```bash
# Set up billing alerts
aws budgets create-budget \
  --account-id your-account-id \
  --budget '{
    "BudgetName": "EvyRoad-Monthly-Budget",
    "BudgetLimit": {
      "Amount": "100",
      "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }'
```

## Deployment Automation

### CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy EvyRoad

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd evyroad-backend && npm ci
      
      - name: Build
        run: cd evyroad-backend && npm run build
      
      - name: Deploy to EC2
        run: |
          # SSH and deploy commands
          # rsync or scp built files
          # Restart PM2 process

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd evyroad-frontend && npm ci
      
      - name: Build
        run: cd evyroad-frontend && npm run build
      
      - name: Deploy to S3
        run: |
          aws s3 sync evyroad-frontend/dist/ s3://evyroad-frontend-prod --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
```

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check PM2 logs with `pm2 logs`
2. **Database connection issues**: Verify security groups and RDS endpoint
3. **Frontend not loading**: Check S3 bucket policy and CloudFront configuration
4. **API calls failing**: Verify CORS settings and API URL configuration

### Health Checks
- Backend: `curl https://api.evyroad.com/health`
- Frontend: Check CloudFront distribution status
- Database: Test connection from EC2 instance

---

For additional support, refer to the AWS documentation or contact the development team.
