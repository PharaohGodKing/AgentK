#!/usr/bin/env python3
"""
Script to run database migrations for AgentK
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.db.migrations.migrate import run_migrations

async def main():
    """Main function"""
    try:
        run_migrations()
        print("Database migrations completed successfully!")
    except Exception as e:
        print(f"Error running migrations: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())