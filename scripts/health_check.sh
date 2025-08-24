#!/bin/bash

# AgentK Health Check Script
echo "🏥 AgentK Health Check"
echo "======================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Load environment
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Default values if not set
API_PORT=${API_PORT:-8000}
PORT=${PORT:-3000}

# Function to check service
check_service() {
    local name=$1
    local url=$2
    local expected=$3
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected"; then
        echo -e "  $name: ${GREEN}✓ Healthy${NC}"
        return 0
    else
        echo -e "  $name: ${RED}✗ Unhealthy${NC}"
        return 1
    fi
}

# Function to check disk usage
check_disk() {
    local path=$1
    local threshold=$2
    local usage=$(df "$path" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt "$threshold" ]; then
        echo -e "  Disk usage ($path): ${GREEN}✓ ${usage}%${NC}"
        return 0
    else
        echo -e "  Disk usage ($path): ${RED}✗ ${usage}% (above ${threshold}%)${NC}"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    local threshold=$1
    local usage=$(free | awk '/Mem:/ {printf("%.0f"), $3/$2 * 100}')
    
    if [ "$usage" -lt "$threshold" ]; then
        echo -e "  Memory usage: ${GREEN}✓ ${usage}%${NC}"
        return 0
    else
        echo -e "  Memory usage: ${RED}✗ ${usage}% (above ${threshold}%)${NC}"
        return 1
    fi
}

# Function to check process
check_process() {
    local name=$1
    local pid_file="/tmp/agentk_$name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "  $name process: ${GREEN}✓ Running (PID: $pid)${NC}"
            return 0
        else
            echo -e "  $name process: ${RED}✗ Not running (stale PID file)${NC}"
            return 1
        fi
    else
        echo -e "  $name process: ${YELLOW}⚠ No PID file${NC}"
        return 2
    fi
}

echo "🔍 Checking services..."
check_process "backend"
check_process "frontend"
check_service "Backend API" "http://localhost:$API_PORT/health" "200"
check_service "Frontend" "http://localhost:$PORT" "200"

echo ""
echo "📊 Checking system resources..."
check_disk "$PROJECT_DIR" 90
check_memory 90

echo ""
echo "🗄️ Checking database..."
if [ -f "data/agentk.db" ]; then
    DB_SIZE=$(du -h "data/agentk.db" | cut -f1)
    echo -e "  Database: ${GREEN}✓ Present (Size: $DB_SIZE)${NC}"
    
    # Check if database is accessible
    if command -v sqlite3 >/dev/null 2>&1; then
        if sqlite3 data/agentk.db "SELECT COUNT(*) FROM agents" >/dev/null 2>&1; then
            echo -e "  Database access: ${GREEN}✓ Accessible${NC}"
        else
            echo -e "  Database access: ${RED}✗ Corrupted or inaccessible${NC}"
        fi
    fi
else
    echo -e "  Database: ${YELLOW}⚠ Not found${NC}"
fi

echo ""
echo "📋 Checking important files..."
important_files=("config.yaml" ".env" "requirements.txt" "package.json")
for file in "${important_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  $file: ${GREEN}✓ Present${NC}"
    else
        echo -e "  $file: ${RED}✗ Missing${NC}"
    fi
done

echo ""
echo "🌐 Checking external dependencies..."
# Check if Python dependencies are installed
if source venv/bin/activate && python -c "import fastapi" 2>/dev/null; then
    echo -e "  Python dependencies: ${GREEN}✓ Installed${NC}"
else
    echo -e "  Python dependencies: ${RED}✗ Missing${NC}"
fi

# Check if Node.js dependencies are installed
if [ -d "frontend/node_modules" ]; then
    echo -e "  Node.js dependencies: ${GREEN}✓ Installed${NC}"
else
    echo -e "  Node.js dependencies: ${RED}✗ Missing${NC}"
fi

echo ""
echo "📝 Summary:"
echo "==========="
# Count issues
issues=0
warnings=0

# Run checks again to count issues
if ! check_process "backend" >/dev/null; then ((issues++)); fi
if ! check_process "frontend" >/dev/null; then ((issues++)); fi
if ! check_service "Backend API" "http://localhost:$API_PORT/health" "200" >/dev/null; then ((issues++)); fi
if ! check_service "Frontend" "http://localhost:$PORT" "200" >/dev/null; then ((issues++)); fi
if ! check_disk "$PROJECT_DIR" 90 >/dev/null; then ((warnings++)); fi
if ! check_memory 90 >/dev/null; then ((warnings++)); fi

if [ $issues -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
elif [ $issues -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Operational with warnings ($warnings warnings)${NC}"
else
    echo -e "${RED}❌ Issues detected ($issues issues, $warnings warnings)${NC}"
fi

echo ""
echo "💡 Recommendations:"
if [ $issues -gt 0 ]; then
    echo "  - Run ./scripts/start.sh to start services"
    echo "  - Check logs in data/logs/"
fi
if [ $warnings -gt 0 ]; then
    echo "  - Consider cleaning up old data"
    echo "  - Monitor system resources"
fi