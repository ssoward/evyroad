#!/bin/bash
# update-env-secrets.sh
# Safely update production .env files with strong secrets and correct API URLs
# Run this script from the root of your EvyRoad project on your Mac

set -e

BACKEND_ENV="evyroad-backend/.env.production"
FRONTEND_ENV="evyroad-frontend/.env.production"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup existing files
cp "$BACKEND_ENV" "$BACKEND_ENV.bak_$DATE"
cp "$FRONTEND_ENV" "$FRONTEND_ENV.bak_$DATE"
echo "Backed up current .env files."

# Generate strong secrets
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')

# Prompt for sensitive values
read -p "Enter your production DB password: " DB_PASSWORD
read -p "Enter your AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "Enter your AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "Enter your S3 Bucket Name: " S3_BUCKET_NAME

# Update backend .env.production
sed -i '' "s|^JWT_SECRET=.*$|JWT_SECRET=$JWT_SECRET|" "$BACKEND_ENV"
sed -i '' "s|^JWT_REFRESH_SECRET=.*$|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" "$BACKEND_ENV"
sed -i '' "s|^DB_PASSWORD=.*$|DB_PASSWORD=$DB_PASSWORD|" "$BACKEND_ENV"
sed -i '' "s|^REDIS_PASSWORD=.*$|REDIS_PASSWORD=$REDIS_PASSWORD|" "$BACKEND_ENV"
sed -i '' "s|^AWS_ACCESS_KEY_ID=.*$|AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID|" "$BACKEND_ENV"
sed -i '' "s|^AWS_SECRET_ACCESS_KEY=.*$|AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY|" "$BACKEND_ENV"
sed -i '' "s|^S3_BUCKET_NAME=.*$|S3_BUCKET_NAME=$S3_BUCKET_NAME|" "$BACKEND_ENV"

echo "Updated backend .env.production with strong secrets and your values."

# Update frontend API URL to use HTTPS and your domain
sed -i '' "s|^VITE_API_URL=.*$|VITE_API_URL=https://evyroad.com/api/v1|" "$FRONTEND_ENV"
echo "Updated frontend .env.production to use HTTPS API URL."

echo "\nAll done! Review your .env.production files, then upload them to your EC2 server using scp:"
echo "scp -i /Users/ssoward/.ssh/evyroad.pem $BACKEND_ENV ec2-user@34.202.160.77:/path/to/your/backend/.env.production"
echo "scp -i /Users/ssoward/.ssh/evyroad.pem $FRONTEND_ENV ec2-user@34.202.160.77:/path/to/your/frontend/.env.production"
