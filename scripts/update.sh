#!/bin/bash

# AgentK Update Script
set -e

echo "🔄 Updating AgentK..."
echo "====================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Backup before update
echo -n "Creating backup before update..."
./scripts/backup.sh >/dev/null 2>&1 || true
echo -e " ${GREEN}✓${NC}"

# Stop services
echo -n "Stopping services..."
./scripts/stop.sh >/dev/null 2>&1
echo -e " ${GREEN}✓${NC}"

# Update from git
echo -n "Pulling latest changes..."
if ! git pull; then
    echo -e " ${RED}✗${NC}"
    echo -e "${RED}Git pull failed! Check your internet connection and permissions.${NC}"
    exit 1
fi
echo -e " ${GREEN}✓${NC}"

# Update Python dependencies
echo -n "Updating Python dependencies..."
source venv/bin/activate
if ! pip install --upgrade -r requirements.txt; then
    echo -e " ${RED}✗${NC}"
    echo -e "${RED}Python dependencies update failed!${NC}"
    exit 1
fi
echo -e " ${GREEN}✓${NC}"

# Update Node.js dependencies
echo -n "Updating Node.js dependencies..."
cd frontend
if ! npm install; then
    echo -e " ${RED}✗${NC}"
    echo -e "${RED}Node.js dependencies update failed!${NC}"
    exit 1
fi

# Build frontend
if ! npm run build; then
    echo -e " ${RED}✗${NC}"
    echo -e "${RED}Frontend build failed!${NC}"
    exit 1
fi
cd ..
echo -e " ${GREEN}✓${NC}"

# Check for configuration updates
if [ -f "config.example.yaml" ] && [ -f "config.yaml" ]; then
    echo -n "Checking for configuration updates..."
    # Compare example config with current config
    if ! diff -u config.yaml config.example.yaml > config.diff 2>/dev/null; then
        echo -e " ${YELLOW}⚠${NC}"
        echo -e "${YELLOW}New configuration options available. Check config.diff for changes.${NC}"
        echo "You may need to update your config.yaml manually."
    else
        echo -e " ${GREEN}✓${NC}"
        rm -f config.diff
    fi
fi

# Start services
echo -n "Starting services..."
./scripts/start.sh >/dev/null 2>&1 &
echo -e " ${GREEN}✓${NC}"

echo ""
echo -e "${GREEN}Update completed successfully! 🎉${NC}"
echo ""
echo "What's new:"
git log --oneline -5
echo ""
echo "To check status: ./scripts/health_check.sh"