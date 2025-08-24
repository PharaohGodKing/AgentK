#!/bin/bash

# AgentK Shutdown Script
echo "🛑 Stopping AgentK..."
echo "====================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop service
stop_service() {
    local name=$1
    local pid_file="/tmp/agentk_$name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -n "Stopping $name (PID: $pid)..."
            kill $pid
            # Wait for process to terminate
            for i in {1..10}; do
                if ! ps -p $pid > /dev/null 2>&1; then
                    break
                fi
                sleep 1
            done
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid
            fi
            rm -f "$pid_file"
            echo -e " ${GREEN}✓${NC}"
        else
            echo -e "${YELLOW}$name PID file exists but process not found${NC}"
            rm -f "$pid_file"
        fi
    else
        echo -e "${YELLOW}$name not running (no PID file)${NC}"
    fi
}

# Stop services
stop_service "backend"
stop_service "frontend"

# Clean up any remaining processes
pkill -f "uvicorn backend.main:app" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

echo ""
echo -e "${GREEN}AgentK stopped successfully!${NC}"