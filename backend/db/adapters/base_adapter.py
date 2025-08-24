from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseDatabaseAdapter(ABC):
    """Abstract base class for database adapters"""
    
    @abstractmethod
    def connect(self):
        """Connect to the database"""
        pass
    
    @abstractmethod
    def disconnect(self):
        """Disconnect from the database"""
        pass
    
    @abstractmethod
    def execute(self, query: str, params: tuple = ()):
        """Execute a SQL query"""
        pass
    
    @abstractmethod
    def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        """Fetch a single row"""
        pass
    
    @abstractmethod
    def fetch_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Fetch all rows"""
        pass
    
    @abstractmethod
    def table_exists(self, table_name: str) -> bool:
        """Check if a table exists"""
        pass