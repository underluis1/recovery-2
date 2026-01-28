#!/bin/bash

# Server Setup Script for n8n & Supabase Deployment
# Usage: ./setup-server.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
DEPLOY_PATH="/opt/deployments/n8n-supabase"

echo "🚀 Setting up $ENVIRONMENT server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Please do not run this script as root"
    exit 1
fi

# Create deployment directory
log_info "Creating deployment directory..."
sudo mkdir -p $DEPLOY_PATH
sudo chown $USER:$USER $DEPLOY_PATH

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log_info "Node.js already installed ($(node --version))"
fi

# Install PostgreSQL client if not present
if ! command -v psql &> /dev/null; then
    log_info "Installing PostgreSQL client..."
    sudo apt-get update
    sudo apt-get install -y postgresql-client
else
    log_info "PostgreSQL client already installed"
fi

# Install Supabase CLI if not present
if ! command -v supabase &> /dev/null; then
    log_info "Installing Supabase CLI..."
    npm install -g supabase
else
    log_info "Supabase CLI already installed ($(supabase --version))"
fi

# Clone repository or update
if [ ! -d "$DEPLOY_PATH/.git" ]; then
    log_info "Repository not found. Please clone it manually:"
    echo "  git clone <your-repo-url> $DEPLOY_PATH"
    log_warn "After cloning, run this script again"
    exit 0
fi

cd $DEPLOY_PATH

# Pull latest changes
log_info "Pulling latest changes..."
git fetch origin
git checkout $ENVIRONMENT
git pull origin $ENVIRONMENT

# Install dependencies
log_info "Installing dependencies..."
npm install --production

# Setup environment file
ENV_FILE="config/.env.$ENVIRONMENT"
ENV_EXAMPLE="config/.env.$ENVIRONMENT.example"

if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        log_warn "Environment file not found. Copying from example..."
        cp $ENV_EXAMPLE $ENV_FILE
        log_warn "Please edit $ENV_FILE with your configuration"
        exit 0
    else
        log_error "No environment file or example found!"
        exit 1
    fi
else
    log_info "Environment file found"
fi

# Setup systemd service for auto-deployment (optional)
log_info "Setting up systemd service for deployment..."

sudo tee /etc/systemd/system/n8n-supabase-deploy.service > /dev/null <<EOF
[Unit]
Description=n8n & Supabase Auto Deployment
After=network.target

[Service]
Type=oneshot
User=$USER
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/npm run deploy:$ENVIRONMENT
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
log_info "Systemd service created"

# Setup git hook for auto-pull (alternative to GitHub Actions)
log_info "Setting up git post-merge hook..."

cat > .git/hooks/post-merge <<'EOF'
#!/bin/bash
echo "Post-merge hook triggered"
npm install --production
npm run deploy:$ENVIRONMENT
EOF

chmod +x .git/hooks/post-merge
log_info "Git hook created"

# Test deployment
log_info "Testing deployment..."
if npm run deploy:$ENVIRONMENT; then
    log_info "Test deployment successful!"
else
    log_error "Test deployment failed. Check logs above."
    exit 1
fi

echo ""
log_info "Server setup completed!"
echo ""
echo "Next steps:"
echo "  1. Edit $ENV_FILE with your credentials"
echo "  2. Test deployment: npm run deploy:$ENVIRONMENT"
echo "  3. Setup GitHub Secrets for automated deployments"
echo ""
