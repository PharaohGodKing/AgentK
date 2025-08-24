"""
Add memory-related tables migration
"""

def upgrade(db):
    """Add memory tables"""
    # Create memory_entries table
    db.execute("""
        CREATE TABLE memory_entries (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            content TEXT NOT NULL,
            embedding BLOB,
            metadata TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES agents (id)
        )
    """)
    
    # Create memory_access table
    db.execute("""
        CREATE TABLE memory_access (
            id TEXT PRIMARY KEY,
            memory_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            access_type TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (memory_id) REFERENCES memory_entries (id),
            FOREIGN KEY (agent_id) REFERENCES agents (id)
        )
    """)
    
    # Create index on memory_entries for faster queries
    db.execute("CREATE INDEX idx_memory_entries_agent_id ON memory_entries (agent_id)")
    db.execute("CREATE INDEX idx_memory_access_timestamp ON memory_access (timestamp)")

def downgrade(db):
    """Remove memory tables"""
    db.execute("DROP TABLE IF EXISTS memory_access")
    db.execute("DROP TABLE IF EXISTS memory_entries")