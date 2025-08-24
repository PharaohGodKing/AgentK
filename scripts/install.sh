#!/bin/bash

# AgentK Installation Script
set -e

echo "🚀 Starting AgentK Installation..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Error: Do not run this script as root. Run as a regular user.${NC}"
    exit 1
fi

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check dependencies
check_dependency() {
    if command -v $1 &> /dev/null; then
        print_status "$1 found: $(command -v $1)"
        return 0
    else
        print_error "$1 not found. Please install it first."
        return 1
    fi
}

echo "Checking dependencies..."
check_dependency python3
check_dependency pip3
check_dependency node
check_dependency npm
check_dependency git

# Create project directory
PROJECT_DIR="$HOME/agentk"
if [ ! -d "$PROJECT_DIR" ]; then
    mkdir -p "$PROJECT_DIR"
    print_status "Created project directory: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Repository already exists, pulling latest changes..."
    git pull
else
    print_status "Cloning AgentK repository..."
    git clone https://github.com/your-username/agentk.git .
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install Python dependencies
print_status "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
cd frontend
npm install
npm run build
cd ..

# Create data directories
print_status "Creating data directories..."
mkdir -p data/logs data/uploads data/backups data/vector_store

# Create default configuration if it doesn't exist
if [ ! -f "config.yaml" ]; then
    print_status "Creating default configuration..."
    cp config.example.yaml config.yaml
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cat > .env << EOF
# AgentK Environment Configuration
NODE_ENV=development
PORT=3000
API_PORT=8000
LM_STUDIO_BASE_URL=http://localhost:1234
OLLAMA_BASE_URL=http://localhost:11434
DATABASE_URL=sqlite:///$PROJECT_DIR/data/agentk.db
REDIS_URL=redis://localhost:6379
EOF
fi

# Set executable permissions on scripts
print_status "Setting executable permissions..."
chmod +x scripts/*.sh

# Create systemd service files (optional)
if [ "$1" = "--systemd" ]; then
    print_status "Creating systemd service files..."
    
    # Backend service
    sudo tee /etc/systemd/system/agentk-backend.service << EOF
[Unit]
Description=AgentK Backend Service
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$PROJECT_DIR
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=$PROJECT_DIR/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    # Frontend service
    sudo tee /etc/systemd/system/agentk-frontend.service << EOF
[Unit]
Description=AgentK Frontend Service
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$PROJECT_DIR/frontend
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    print_warning "Systemd services created. Enable with: systemctl enable agentk-backend agentk-frontend"
fi

print_status "Installation complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Configure your models in config.yaml"
echo "2. Start the application: ./scripts/start.sh"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For troubleshooting, see docs/TROUBLESHOOTING.md"