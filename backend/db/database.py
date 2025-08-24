import sqlalchemy
from backend.core.config import settings # We can add DB config here later

# The location of our SQLite database file. It will be created in the data directory.
DATABASE_URL = "sqlite:///./data/databases/agentk.db"

# SQLAlchemy engine: the core interface to the database.
engine = sqlalchemy.create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} # Needed for SQLite
)

# MetaData object: holds the schema of all our tables.
metadata = sqlalchemy.MetaData()

# Define the 'agents' table
agents_table = sqlalchemy.Table(
    "agents",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True, index=True),
    sqlalchemy.Column("name", sqlalchemy.String, index=True),
    sqlalchemy.Column("role", sqlalchemy.String),
    sqlalchemy.Column("status", sqlalchemy.String),
)

# Define the 'workflows' table (we'll use this later)
workflows_table = sqlalchemy.Table(
    "workflows",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True, index=True),
    sqlalchemy.Column("name", sqlalchemy.String, index=True),
    sqlalchemy.Column("description", sqlalchemy.String),
    # For simplicity, steps can be stored as JSON, though a separate table is better for complex cases
    sqlalchemy.Column("steps", sqlalchemy.JSON),
)

# Function to create the database and tables
async def create_db_and_tables():
    # Use a try-except block to handle the case where the folder doesn't exist yet
    import os
    os.makedirs("data/databases", exist_ok=True)
    metadata.create_all(engine)