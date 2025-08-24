#!/bin/bash

# AgentK Startup Script
set -e

echo "🚀 Starting AgentK..."
echo "====================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start service
start_service() {
    local name=$1
    local command=$2
    local log_file=$3
    
    echo -n "Starting $name..."
    $command >> "$log_file" 2>&1 &
    local pid=$!
    echo $pid > "/tmp/agentk_$name.pid"
    echo -e " ${GREEN}✓${NC} (PID: $pid)"
}

# Check if already running
if [ -f "/tmp/agentk_backend.pid" ] || [ -f "/tmp/agentk_frontend.pid" ]; then
    echo -e "${YELLOW}AgentK seems to be already running. Use ./scripts/stop.sh first.${NC}"
    exit 1
fi

# Check dependencies
if [ ! -d "venv" ]; then
    echo -e "${RED}Virtual environment not found. Run ./scripts/install.sh first.${NC}"
    exit 1
fi

# Create log directory
mkdir -p data/logs

# Load environment
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Check ports
if check_port $API_PORT; then
    echo -e "${RED}Port $API_PORT is already in use.${NC}"
    exit 1
fi

if check_port $PORT; then
    echo -e "${RED}Port $PORT is already in use.${NC}"
    exit 1
fi

# Start backend
source venv/bin/activate
start_service "backend" "python -m uvicorn backend.main:app --host 0.0.0.0 --port $API_PORT" "data/logs/backend.log"

# Wait for backend to start
echo -n "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:$API_PORT/health >/dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e " ${RED}✗${NC}"
        echo -e "${RED}Backend failed to start. Check data/logs/backend.log${NC}"
        ./scripts/stop.sh
        exit 1
    fi
    sleep 1
done

# Start frontend
cd frontend
start_service "frontend" "npm run dev" "../data/logs/frontend.log"
cd ..

# Wait for frontend to start
echo -n "Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s http://localhost:$PORT >/dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e " ${RED}✗${NC}"
        echo -e "${RED}Frontend failed to start. Check data/logs/frontend.log${NC}"
        ./scripts/stop.sh
        exit 1
    fi
    sleep 1
done

echo ""
echo -e "${GREEN}AgentK started successfully! 🎉${NC}"
echo "Backend: http://localhost:$API_PORT"
echo "Frontend: http://localhost:$PORT"
echo "API Docs: http://localhost:$API_PORT/docs"
echo ""
echo "Logs:"
echo "  Backend: data/logs/backend.log"
echo "  Frontend: data/logs/frontend.log"
echo ""
echo "To stop: ./scripts/stop.sh"