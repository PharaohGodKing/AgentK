#!/usr/bin/env python3
"""
Script to create an admin user for AgentK
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.db.database import get_db
from backend.utils.crypto import hash_password

async def create_admin_user(username: str, email: str, password: str):
    """Create an admin user in the database"""
    db = get_db()
    
    # Check if user already exists
    existing_user = db.fetch_one(
        "SELECT * FROM users WHERE username = ? OR email = ?", 
        (username, email)
    )
    
    if existing_user:
        print(f"User with username '{username}' or email '{email}' already exists!")
        return False
    
    # Hash password
    hashed_password = hash_password(password)
    
    # Create user
    user_id = f"user_{username.lower()}"
    db.execute(
        """INSERT INTO users (id, username, email, password_hash, is_active, is_superuser)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (user_id, username, email, hashed_password, True, True)
    )
    
    print(f"Admin user '{username}' created successfully!")
    print(f"User ID: {user_id}")
    print(f"Email: {email}")
    
    return True

async def main():
    """Main function"""
    if len(sys.argv) != 4:
        print("Usage: python create_admin.py <username> <email> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    
    success = await create_admin_user(username, email, password)
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())