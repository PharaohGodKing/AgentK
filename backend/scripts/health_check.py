#!/usr/bin/env python3
"""
Script to check the health of the AgentK system
"""

import asyncio
import aiohttp
import psutil
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.core.config import settings

async def check_api_health():
    """Check if the API is healthy"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"http://{settings.HOST}:{settings.PORT}/health", timeout=5) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("status") == "healthy"
    except:
        return False
    return False

async def check_database_health():
    """Check if the database is accessible"""
    try:
        from backend.db.database import get_db
        db = get_db()
        db.connect()
        # Simple query to test connection
        result = db.fetch_one("SELECT 1 as test")
        db.disconnect()
        return result is not None and result["test"] == 1
    except:
        return False

async def check_system_resources():
    """Check system resource usage"""
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "cpu": cpu_percent,
        "memory": memory.percent,
        "disk": disk.percent,
        "healthy": cpu_percent < 90 and memory.percent < 90 and disk.percent < 90
    }

async def main():
    """Main function"""
    print("Running AgentK health check...")
    
    # Check API health
    api_healthy = await check_api_health()
    print(f"API Health: {'✅ Healthy' if api_healthy else '❌ Unhealthy'}")
    
    # Check database health
    db_healthy = await check_database_health()
    print(f"Database Health: {'✅ Healthy' if db_healthy else '❌ Unhealthy'}")
    
    # Check system resources
    resources = await check_system_resources()
    print(f"CPU Usage: {resources['cpu']}% {'✅' if resources['cpu'] < 90 else '❌'}")
    print(f"Memory Usage: {resources['memory']}% {'✅' if resources['memory'] < 90 else '❌'}")
    print(f"Disk Usage: {resources['disk']}% {'✅' if resources['disk'] < 90 else '❌'}")
    
    # Overall health
    overall_healthy = api_healthy and db_healthy and resources["healthy"]
    print(f"\nOverall Status: {'✅ All systems healthy!' if overall_healthy else '❌ Issues detected!'}")
    
    if not overall_healthy:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())