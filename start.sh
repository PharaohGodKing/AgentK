#!/bin/bash

# AgentK Startup Script

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if running in production
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🚀 Starting AgentK in production mode..."
    exec python -m backend.main
else
    echo "🔧 Starting AgentK in development mode..."
    npm run dev
fi