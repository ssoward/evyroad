#!/bin/bash
# setup-production-database.sh
# Install and configure PostgreSQL on EC2 for EvyRoad production

set -e

echo "Setting up PostgreSQL for EvyRoad production..."

# Generate a strong database password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
echo "Generated database password: $DB_PASSWORD"

# Install PostgreSQL
sudo yum update -y
sudo yum install -y postgresql15-server postgresql15-contrib

# Initialize the database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure PostgreSQL
sudo -u postgres psql << EOF
-- Create database user
CREATE USER evyroad_user WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE evyroad_prod OWNER evyroad_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE evyroad_prod TO evyroad_user;

-- Exit
\q
EOF

# Update pg_hba.conf to allow local connections with password
sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' /var/lib/pgsql/data/pg_hba.conf

# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql

echo "PostgreSQL setup complete!"
echo "Database: evyroad_prod"
echo "User: evyroad_user"
echo "Password: $DB_PASSWORD"
echo ""
echo "Please update your backend .env.production file with:"
echo "DB_HOST=localhost"
echo "DB_PORT=5432"
echo "DB_NAME=evyroad_prod"
echo "DB_USER=evyroad_user"
echo "DB_PASSWORD=$DB_PASSWORD"
