from backend.db.database import get_db

def run_migrations():
    """Run all database migrations"""
    db = get_db()
    
    # Check current schema version
    if not db.table_exists("schema_version"):
        db.execute("""
            CREATE TABLE schema_version (
                version INTEGER PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        current_version = 0
    else:
        result = db.fetch_one("SELECT MAX(version) as version FROM schema_version")
        current_version = result["version"] if result and result["version"] is not None else 0
    
    # Run migrations in order
    migrations = [
        _migration_001_initial,
        _migration_002_add_memory,
        # Add future migrations here
    ]
    
    for i, migration in enumerate(migrations, start=1):
        if i > current_version:
            print(f"Applying migration {i}...")
            migration(db)
            db.execute("INSERT INTO schema_version (version) VALUES (?)", (i,))
            print(f"Migration {i} applied successfully")
    
    print(f"Database is at version {len(migrations)}")

def _migration_001_initial(db):
    """Initial schema migration"""
    # This migration was already applied in init_db
    pass

def _migration_002_add_memory(db):
    """Add memory-related tables"""
    # Create memory_entries table
    if not db.table_exists("memory_entries"):
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
    if not db.table_exists("memory_access"):
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