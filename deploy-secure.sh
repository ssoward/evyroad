#!/bin/bash

# EvyRoad Secure Deployment Script
# Uses deploy-config.sh for server configuration
# Version: 2.1

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# =============================================================================
# CONFIGURATION LOADING
# =============================================================================

load_deploy_config() {
    local config_file="$SCRIPT_DIR/deploy-config.sh"
    
    if [[ ! -f "$config_file" ]]; then
        echo -e "${RED}❌ Deploy configuration not found: $config_file${NC}"
        echo -e "${YELLOW}💡 Run this script to create it:${NC}"
        echo "   ./create-deploy-config.sh"
        exit 1
    fi
    
    echo -e "${BLUE}📋 Loading deployment configuration...${NC}"
    source "$config_file"
    
    # Verify required variables
    local required_vars=(
        "DEPLOY_SERVER_IP"
        "DEPLOY_SERVER_USER" 
        "DEPLOY_SSH_KEY_PATH"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            echo -e "${RED}❌ Required variable $var is not set${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}✅ Configuration loaded successfully${NC}"
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🚀 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "${YELLOW}📍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# =============================================================================
# DEPLOYMENT FUNCTIONS
# =============================================================================

check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if SSH key exists
    if [[ ! -f "$DEPLOY_SSH_KEY_PATH" ]]; then
        print_error "SSH key not found: $DEPLOY_SSH_KEY_PATH"
        exit 1
    fi
    
    # Check SSH key permissions
    local key_perms=$(stat -f "%A" "$DEPLOY_SSH_KEY_PATH" 2>/dev/null || stat -c "%a" "$DEPLOY_SSH_KEY_PATH" 2>/dev/null)
    if [[ "$key_perms" != "400" && "$key_perms" != "600" ]]; then
        print_step "Fixing SSH key permissions..."
        chmod 600 "$DEPLOY_SSH_KEY_PATH"
    fi
    
    # Test server connection
    if ! check_server_connection; then
        print_error "Cannot connect to server"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

deploy_backend() {
    print_step "Deploying backend..."
    
    # Build backend locally if needed
    if [[ -d "$SCRIPT_DIR/evyroad-backend" ]]; then
        cd "$SCRIPT_DIR/evyroad-backend"
        print_step "Installing backend dependencies..."
        npm install --production
        
        print_step "Building backend..."
        npm run build 2>/dev/null || echo "No build script found, skipping..."
        
        cd "$SCRIPT_DIR"
    fi
    
    # Sync backend to server
    print_step "Syncing backend files to server..."
    deploy_rsync "$SCRIPT_DIR/evyroad-backend/" "$DEPLOY_BACKEND_PATH/"
    
    # Install dependencies on server
    print_step "Installing backend dependencies on server..."
    deploy_ssh "cd $DEPLOY_BACKEND_PATH && npm install --production"
    
    # Restart backend service
    print_step "Restarting backend service..."
    deploy_ssh "sudo systemctl restart $DEPLOY_BACKEND_SERVICE" || {
        print_error "Failed to restart backend service"
        return 1
    }
    
    # Wait for service to start
    sleep 5
    
    # Check if service is running
    local status=$(deploy_ssh "sudo systemctl is-active $DEPLOY_BACKEND_SERVICE")
    if [[ "$status" == "active" ]]; then
        print_success "Backend deployed successfully"
    else
        print_error "Backend service failed to start"
        deploy_ssh "sudo systemctl status $DEPLOY_BACKEND_SERVICE --no-pager -l"
        return 1
    fi
}

deploy_frontend() {
    print_step "Deploying frontend..."
    
    # Build frontend locally
    if [[ -d "$SCRIPT_DIR/evyroad-frontend" ]]; then
        cd "$SCRIPT_DIR/evyroad-frontend"
        
        print_step "Installing frontend dependencies..."
        npm install
        
        print_step "Building frontend for production..."
        npm run build
        
        cd "$SCRIPT_DIR"
    fi
    
    # Sync frontend build to server
    print_step "Syncing frontend build to server..."
    if [[ -d "$SCRIPT_DIR/evyroad-frontend/dist" ]]; then
        deploy_rsync "$SCRIPT_DIR/evyroad-frontend/dist/" "/var/www/evyroad/public/"
    else
        print_error "Frontend build directory not found"
        return 1
    fi
    
    # Fix permissions
    print_step "Setting correct permissions for frontend files..."
    deploy_ssh "sudo chown -R nginx:nginx /var/www/evyroad/public"
    deploy_ssh "sudo find /var/www/evyroad/public -type f -exec chmod 644 {} +"
    deploy_ssh "sudo find /var/www/evyroad/public -type d -exec chmod 755 {} +"
    
    # Reload nginx
    print_step "Reloading Nginx..."
    deploy_ssh "sudo systemctl reload nginx"
    
    print_success "Frontend deployed successfully"
}

run_health_checks() {
    print_step "Running health checks..."
    
    # Check website
    print_step "Checking website accessibility..."
    local website_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_DOMAIN" || echo "000")
    if [[ "$website_status" == "200" ]]; then
        print_success "Website is accessible: https://$DEPLOY_DOMAIN"
    else
        print_error "Website returned status: $website_status"
    fi
    
    # Check API
    print_step "Checking API health..."
    local api_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_DOMAIN/api/health" || echo "000")
    if [[ "$api_status" == "200" ]]; then
        print_success "API is healthy: https://$DEPLOY_DOMAIN/api/health"
    else
        print_error "API returned status: $api_status"
        
        # Show backend logs for debugging
        print_step "Checking backend logs..."
        deploy_ssh "sudo journalctl -u $DEPLOY_BACKEND_SERVICE --no-pager -n 20"
    fi
}

show_deployment_summary() {
    print_header "Deployment Summary"
    
    echo -e "${BLUE}🌐 Website:${NC} https://$DEPLOY_DOMAIN"
    echo -e "${BLUE}🔌 API:${NC} https://$DEPLOY_DOMAIN/api/health"
    echo -e "${BLUE}📊 Server:${NC} $DEPLOY_SERVER_USER@$DEPLOY_SERVER_IP"
    echo ""
    
    # Show service statuses
    echo -e "${BLUE}📋 Service Status:${NC}"
    local backend_status=$(check_service_status "$DEPLOY_BACKEND_SERVICE")
    local nginx_status=$(check_service_status "$DEPLOY_NGINX_SERVICE")
    local postgres_status=$(check_service_status "$DEPLOY_POSTGRES_SERVICE")
    
    echo "   Backend: $backend_status"
    echo "   Nginx: $nginx_status"
    echo "   PostgreSQL: $postgres_status"
    echo ""
    
    echo -e "${GREEN}🎉 Deployment completed!${NC}"
}

# =============================================================================
# MAIN DEPLOYMENT WORKFLOW
# =============================================================================

main() {
    print_header "EvyRoad Secure Deployment"
    
    # Load configuration
    load_deploy_config
    
    # Show server info
    get_server_info
    echo ""
    
    # Check prerequisites
    check_prerequisites
    echo ""
    
    # Ask for confirmation
    echo -e "${YELLOW}🤔 Do you want to proceed with deployment? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⏹️  Deployment cancelled${NC}"
        exit 0
    fi
    
    echo ""
    
    # Deploy components
    deploy_backend
    echo ""
    
    deploy_frontend  
    echo ""
    
    # Run health checks
    run_health_checks
    echo ""
    
    # Show summary
    show_deployment_summary
}

# =============================================================================
# SCRIPT OPTIONS
# =============================================================================

case "${1:-deploy}" in
    "deploy" | "")
        main
        ;;
    "status")
        load_deploy_config
        deployment_status
        ;;
    "info")
        load_deploy_config
        get_server_info
        ;;
    "ssh")
        load_deploy_config
        echo -e "${BLUE}🔗 Connecting to server...${NC}"
        deploy_ssh
        ;;
    "logs")
        load_deploy_config
        echo -e "${BLUE}📋 Backend logs:${NC}"
        deploy_ssh "sudo journalctl -u $DEPLOY_BACKEND_SERVICE --no-pager -f"
        ;;
    "help")
        echo "EvyRoad Secure Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy    Full deployment (default)"
        echo "  status    Show deployment status"
        echo "  info      Show server information"
        echo "  ssh       Connect to server via SSH"
        echo "  logs      Show live backend logs"
        echo "  help      Show this help message"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Run '$0 help' for available commands"
        exit 1
        ;;
esac
