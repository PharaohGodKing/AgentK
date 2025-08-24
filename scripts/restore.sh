#!/bin/bash

# AgentK Restore Script
set -e

echo "🔄 Restoring AgentK Backup..."
echo "============================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    echo "Available backups:"
    ls -la data/backups/backup_*.tar.gz 2>/dev/null | awk '{print $9}' || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Verify backup integrity
echo -n "Verifying backup integrity..."
if ! tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
    echo -e " ${RED}✗${NC}"
    echo -e "${RED}Backup file is corrupt or invalid!${NC}"
    exit 1
fi
echo -e " ${GREEN}✓${NC}"

# Confirm restoration
read -p "This will overwrite current data. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restoration cancelled.${NC}"
    exit 0
fi

# Stop services
echo -n "Stopping services..."
./scripts/stop.sh >/dev/null 2>&1
echo -e " ${GREEN}✓${NC}"

# Backup current data first
echo -n "Creating pre-restore backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p data/backups
tar -czf "data/backups/pre_restore_$TIMESTAMP.tar.gz" \
    data/agentk.db \
    data/uploads/ \
    data/vector_store/ \
    config.yaml \
    .env 2>/dev/null || true
echo -e " ${GREEN}✓${NC}"

# Extract backup
echo -n "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C .
echo -e " ${GREEN}✓${NC}"

# Fix permissions
echo -n "Fixing permissions..."
chmod 644 data/agentk.db 2>/dev/null || true
chmod -R 755 data/uploads 2>/dev/null || true
chmod -R 755 data/vector_store 2>/dev/null || true
echo -e " ${GREEN}✓${NC}"

# Start services
echo -n "Starting services..."
./scripts/start.sh >/dev/null 2>&1 &
echo -e " ${GREEN}✓${NC}"

echo ""
echo -e "${GREEN}Restoration completed successfully! 🎉${NC}"
echo "Previous data backed up to: data/backups/pre_restore_$TIMESTAMP.tar.gz"
echo ""
echo "To verify restoration, check:"
echo "  - Application is running: ./scripts/health_check.sh"
echo "  - Data integrity: Check logs and application functionality"