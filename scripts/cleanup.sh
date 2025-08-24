#!/bin/bash

# AgentK Cleanup Script
echo "🧹 Cleaning up AgentK system..."
echo "==============================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Confirm cleanup
read -p "This will remove temporary files and logs. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cleanup cancelled.${NC}"
    exit 0
fi

# Stop services first
echo -n "Stopping services..."
./scripts/stop.sh >/dev/null 2>&1
echo -e " ${GREEN}✓${NC}"

# Cleanup tasks
echo "Performing cleanup..."

# 1. Remove temporary files
echo -n "Removing temporary files..."
rm -rf /tmp/agentk_*.pid 2>/dev/null || true
rm -rf frontend/.next 2>/dev/null || true
rm -rf frontend/.cache 2>/dev/null || true
rm -rf __pycache__ 2>/dev/null || true
rm -rf backend/__pycache__ 2>/dev/null || true
rm -rf plugins/__pycache__ 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true
find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true
echo -e " ${GREEN}✓${NC}"

# 2. Cleanup log files (keep last 7 days)
echo -n "Rotating log files..."
if [ -d "data/logs" ]; then
    find data/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    # Create fresh log files
    touch data/logs/backend.log 2>/dev/null || true
    touch data/logs/frontend.log 2>/dev/null || true
fi
echo -e " ${GREEN}✓${NC}"

# 3. Cleanup old backups (keep last 30 days)
echo -n "Cleaning up old backups..."
if [ -d "data/backups" ]; then
    find data/backups -name "*.tar.gz" -mtime +30 -delete 2>/dev/null || true
fi
echo -e " ${GREEN}✓${NC}"

# 4. Cleanup npm cache
echo -n "Cleaning npm cache..."
cd frontend
npm cache clean --force 2>/dev/null || true
cd ..
echo -e " ${GREEN}✓${NC}"

# 5. Cleanup Python cache
echo -n "Cleaning Python cache..."
if [ -d "venv" ]; then
    source venv/bin/activate
    python -m pip cache purge 2>/dev/null || true
fi
echo -e " ${GREEN}✓${NC}"

# 6. Cleanup uploads (keep last 30 days)
echo -n "Cleaning up old uploads..."
if [ -d "data/uploads" ]; then
    find data/uploads -type f -mtime +30 -delete 2>/dev/null || true
    find data/uploads -type d -empty -delete 2>/dev/null || true
fi
echo -e " ${GREEN}✓${NC}"

# 7. Check disk usage
echo ""
echo "📊 Disk usage after cleanup:"
du -sh $PROJECT_DIR 2>/dev/null || true
du -sh data/ 2>/dev/null || true
du -sh data/logs/ 2>/dev/null || true
du -sh data/backups/ 2>/dev/null || true
du -sh data/uploads/ 2>/dev/null || true

echo ""
echo -e "${GREEN}Cleanup completed successfully! 🧹${NC}"
echo ""
echo "To start fresh: ./scripts/start.sh"