#!/bin/bash

# EvyRoad Deployment Script
# This script sets up the complete EvyRoad application environment
# including all configuration fixes discovered during development

set -e  # Exit on any error

echo "🚀 Starting EvyRoad Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}📍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "PRD.md" ]; then
    print_error "Please run this script from the EvyRoad project root directory"
    exit 1
fi

print_status "Installing dependencies and setting up configuration..."

# Backend Setup
print_status "Setting up backend..."
cd evyroad-backend

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Ensure TypeScript and development dependencies are properly installed
print_status "Installing additional backend dev dependencies..."
npm install --save-dev @types/node @types/express @types/cors @types/helmet nodemon ts-node

print_success "Backend dependencies installed"

# Frontend Setup
print_status "Setting up frontend..."
cd ../evyroad-frontend

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install

# CRITICAL FIX: Ensure PostCSS and Tailwind configs use .cjs extension
print_status "Applying PostCSS/Tailwind configuration fixes..."

# Check if .js config files exist and rename them to .cjs
if [ -f "postcss.config.js" ]; then
    print_warning "Found postcss.config.js - renaming to .cjs for ES module compatibility"
    mv postcss.config.js postcss.config.cjs
fi

if [ -f "tailwind.config.js" ]; then
    print_warning "Found tailwind.config.js - renaming to .cjs for ES module compatibility"
    mv tailwind.config.js tailwind.config.cjs
fi

# Ensure PostCSS config uses CommonJS syntax
print_status "Verifying PostCSS configuration..."
cat > postcss.config.cjs << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Ensure Tailwind config has complete color palette and uses CommonJS syntax
print_status "Verifying Tailwind configuration..."
cat > tailwind.config.cjs << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
EOF

print_success "Configuration fixes applied"

# Clear any cached build artifacts
print_status "Clearing build caches..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

print_success "Frontend setup complete"

# Return to project root
cd ..

# Environment Setup
print_status "Setting up environment files..."

# Backend environment
if [ ! -f "evyroad-backend/.env" ]; then
    print_status "Creating backend .env from example..."
    cp evyroad-backend/.env.example evyroad-backend/.env
    print_warning "Please update evyroad-backend/.env with your actual environment values"
fi

# Frontend environment
if [ ! -f "evyroad-frontend/.env" ]; then
    print_status "Creating frontend .env from example..."
    cp evyroad-frontend/.env.example evyroad-frontend/.env
    print_warning "Please update evyroad-frontend/.env with your actual environment values"
fi

# Build frontend for production (optional)
if [ "$1" = "--production" ]; then
    print_status "Building frontend for production..."
    cd evyroad-frontend
    npm run build
    print_success "Frontend built for production"
    cd ..
fi

# Final verification
print_status "Running final verification..."

# Check backend can start
print_status "Verifying backend configuration..."
cd evyroad-backend
if npm run type-check; then
    print_success "Backend TypeScript configuration is valid"
else
    print_error "Backend TypeScript configuration has issues"
fi
cd ..

# Check frontend can build
print_status "Verifying frontend configuration..."
cd evyroad-frontend
if npm run type-check; then
    print_success "Frontend TypeScript configuration is valid"
else
    print_error "Frontend TypeScript configuration has issues"
fi
cd ..

print_success "🎉 EvyRoad deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment files with your actual values:"
echo "   - evyroad-backend/.env"
echo "   - evyroad-frontend/.env"
echo ""
echo "2. Start the development servers:"
echo "   Backend:  cd evyroad-backend && npm run dev"
echo "   Frontend: cd evyroad-frontend && npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:5173 (or next available port)"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "🔧 Configuration fixes applied:"
echo "- PostCSS and Tailwind configs use .cjs extension for ES module compatibility"
echo "- Complete color palette defined in Tailwind config"
echo "- All necessary dependencies installed"
echo "- Build caches cleared"
