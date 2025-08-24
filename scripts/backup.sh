#!/bin/bash

# AgentK Backup Script
set -e

echo "💾 Creating AgentK Backup..."
echo "============================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Configuration
BACKUP_DIR="data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if there's data to backup
if [ ! -f "data/agentk.db" ] && [ ! -d "data/uploads" ] && [ ! -d "data/vector_store" ]; then
    echo -e "${YELLOW}No data found to backup.${NC}"
    exit 0
fi

# Stop services to ensure consistent backup
echo -n "Stopping services..."
./scripts/stop.sh >/dev/null 2>&1 || true
echo -e " ${GREEN}✓${NC}"

# Create backup
echo -n "Creating backup file..."
tar -czf "$BACKUP_FILE" \
    data/agentk.db \
    data/uploads/ \
    data/vector_store/ \
    config.yaml \
    .env 2>/dev/null || true
echo -e " ${GREEN}✓${NC}"

# Start services again
echo -n "Starting services..."
./scripts/start.sh >/dev/null 2>&1 &
echo -e " ${GREEN}✓${NC}"

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "Backup created: ${GREEN}$BACKUP_FILE${NC} (Size: $BACKUP_SIZE)"
    
    # Test backup integrity
    if tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
        echo -e "Backup integrity: ${GREEN}✓${NC}"
    else
        echo -e "Backup integrity: ${RED}✗${NC}"
        rm -f "$BACKUP_FILE"
        exit 1
    fi
else
    echo -e "${RED}Backup creation failed!${NC}"
    exit 1
fi

# Clean up old backups
echo -n "Cleaning up old backups..."
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
echo -e " ${GREEN}✓${NC}"

# List backups
echo ""
echo "Available backups:"
ls -la "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | awk '{print $9 " (" $5 " bytes)"}' || echo "No backups found"

echo ""
echo -e "${GREEN}Backup completed successfully! 🎉${NC}"
echo "To restore: ./scripts/restore.sh $BACKUP_FILE"