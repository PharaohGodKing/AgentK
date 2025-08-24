#!/bin/bash

# AgentK Diagnostics Script
echo "🔍 AgentK System Diagnostics"
echo "============================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Create diagnostics directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DIAG_DIR="data/diagnostics/diagnostic_$TIMESTAMP"
mkdir -p "$DIAG_DIR"

echo "Collecting system information..."
echo "Output directory: $DIAG_DIR"

# Function to collect info
collect_info() {
    local name=$1
    local command=$2
    echo -n "Collecting $name..."
    $command > "$DIAG_DIR/$name.txt" 2>&1
    echo -e " ${GREEN}✓${NC}"
}

# System information
collect_info "system_info" "uname -a"
collect_info "os_release" "cat /etc/*release 2>/dev/null || sw_vers 2>/dev/null || echo 'Unknown'"
collect_info "memory_info" "free -h"
collect_info "disk_info" "df -h"
collect_info "cpu_info" "lscpu 2>/dev/null || sysctl -n machdep.cpu 2>/dev/null || echo 'CPU info not available'"

# AgentK information
collect_info "agentk_version" "git log --oneline -1 || echo 'Not a git repository'"
collect_info "python_version" "python --version"
collect_info "node_version" "node --version"
collect_info "npm_version" "npm --version"

# Process information
collect_info "processes" "ps aux | grep -E '(agentk|uvicorn|npm)' | grep -v grep"

# Network information
collect_info "network_ports" "netstat -tulpn 2>/dev/null || lsof -i -P -n | grep LISTEN"

# Check services
collect_info "service_status" "./scripts/health_check.sh"

# Configuration files (redacted)
collect_info "config" "cat config.yaml 2>/dev/null | sed 's/\(api_key\|password\|secret\):.*/\1: [REDACTED]/g' || echo 'No config.yaml'"
collect_info "env" "cat .env 2>/dev/null | sed 's/\(API_KEY\|PASSWORD\|SECRET\)=.*/\1=[REDACTED]/g' || echo 'No .env file'"

# Log files (last 100 lines)
collect_info "backend_log" "tail -100 data/logs/backend.log 2>/dev/null || echo 'No backend log'"
collect_info "frontend_log" "tail -100 data/logs/frontend.log 2>/dev/null || echo 'No frontend log'"

# Database info
collect_info "database_info" "ls -la data/agentk.db 2>/dev/null && sqlite3 data/agentk.db .tables 2>/dev/null || echo 'No database found'"

# Disk usage
collect_info "disk_usage" "du -sh . du -sh data/ du -sh data/*/ 2>/dev/null"

# Permission info
collect_info "permissions" "ls -la . ls -la data/ ls -la scripts/ 2>/dev/null"

# Dependency information
collect_info "python_packages" "pip list 2>/dev/null || echo 'Pip not available'"
collect_info "node_packages" "npm list 2>/dev/null || echo 'NPM not available'"

# Create summary report
cat > "$DIAG_DIR/summary.txt" << EOF
AgentK Diagnostic Report
Generated: $(date)
System: $(uname -a)
Directory: $PROJECT_DIR

=== Services Status ===
$(./scripts/health_check.sh 2>/dev/null)

=== Disk Usage ===
$(df -h . 2>/dev/null)

=== Memory Usage ===
$(free -h 2>/dev/null)

=== Important Files ===
$(ls -la config.yaml .env data/agentk.db 2>/dev/null | awk '{print $9 " (" $5 " bytes)"}')

=== Issues Detected ===
$(grep -r "✗\|Error\|Failed" "$DIAG_DIR" | head -10)
EOF

# Create archive
echo -n "Creating diagnostic archive..."
tar -czf "$DIAG_DIR.tar.gz" -C "$DIAG_DIR" .
rm -rf "$DIAG_DIR"
echo -e " ${GREEN}✓${NC}"

echo ""
echo -e "${GREEN}Diagnostics complete! 📋${NC}"
echo "Archive created: $DIAG_DIR.tar.gz"
echo ""
echo "This archive contains:"
echo "  - System information"
echo "  - Service status"
echo "  - Configuration (redacted)"
echo "  - Log snippets"
echo "  - Resource usage"
echo ""
echo "Use this file when seeking support for issues."