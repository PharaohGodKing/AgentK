#!/usr/bin/env python3
"""
Script to backup the AgentK database
"""

import asyncio
import shutil
from datetime import datetime
from pathlib import Path
import sys

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.core.config import settings

async def backup_database():
    """Backup the database"""
    if settings.DATABASE_TYPE != "sqlite":
        print("Backup is only supported for SQLite databases!")
        return False
    
    # Get database path
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    db_file = Path(db_path)
    
    if not db_file.exists():
        print(f"Database file {db_path} does not exist!")
        return False
    
    # Create backup directory
    backup_dir = Path("backups")
    backup_dir.mkdir(exist_ok=True)
    
    # Create backup filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"agentk_backup_{timestamp}.db"
    
    # Copy database file
    shutil.copy2(db_file, backup_file)
    
    print(f"Database backed up to: {backup_file}")
    return True

async def main():
    """Main function"""
    success = await backup_database()
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())