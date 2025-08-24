"""
Initial database migration
"""

def upgrade(db):
    """Apply initial schema"""
    # Create agents table
    db.execute("""
        CREATE TABLE agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            model TEXT NOT NULL,
            capabilities TEXT NOT NULL,
            config TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create workflows table
    db.execute("""
        CREATE TABLE workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            nodes TEXT NOT NULL,
            config TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create plugins table
    db.execute("""
        CREATE TABLE plugins (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            version TEXT NOT NULL,
            author TEXT NOT NULL,
            capabilities TEXT NOT NULL,
            config_schema TEXT NOT NULL,
            config TEXT NOT NULL,
            status TEXT NOT NULL,
            installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create chat_history table
    db.execute("""
        CREATE TABLE chat_history (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES agents (id)
        )
    """)

def downgrade(db):
    """Revert initial schema"""
    db.execute("DROP TABLE IF EXISTS chat_history")
    db.execute("DROP TABLE IF EXISTS plugins")
    db.execute("DROP TABLE IF EXISTS workflows")
    db.execute("DROP TABLE IF EXISTS agents")