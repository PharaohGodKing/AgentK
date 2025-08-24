import sqlite3
from typing import List, Dict, Any, Optional
from pathlib import Path
from backend.db.adapters.base_adapter import BaseDatabaseAdapter

class SQLiteAdapter(BaseDatabaseAdapter):
    """SQLite database adapter"""
    
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.connection = None
    
    def connect(self):
        """Connect to the SQLite database"""
        if self.db_url.startswith("sqlite:///"):
            db_path = self.db_url.replace("sqlite:///", "")
            # Create directory if it doesn't exist
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)
            self.connection = sqlite3.connect(db_path)
            self.connection.row_factory = sqlite3.Row
        else:
            raise ValueError(f"Invalid SQLite URL: {self.db_url}")
    
    def disconnect(self):
        """Disconnect from the database"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def execute(self, query: str, params: tuple = ()):
        """Execute a SQL query"""
        if not self.connection:
            self.connect()
        
        cursor = self.connection.cursor()
        cursor.execute(query, params)
        self.connection.commit()
        return cursor
    
    def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        """Fetch a single row"""
        cursor = self.execute(query, params)
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    def fetch_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Fetch all rows"""
        cursor = self.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def table_exists(self, table_name: str) -> bool:
        """Check if a table exists"""
        query = "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
        result = self.fetch_one(query, (table_name,))
        return result is not None