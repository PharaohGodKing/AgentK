from typing import List, Dict, Any, Optional
import aiohttp
import json
from backend.db.adapters.base_adapter import BaseDatabaseAdapter

class SurrealDBAdapter(BaseDatabaseAdapter):
    """SurrealDB database adapter"""
    
    def __init__(self, db_url: str, namespace: str = "agentk", database: str = "main"):
        self.db_url = db_url
        self.namespace = namespace
        self.database = database
        self.session = None
    
    async def connect(self):
        """Connect to the SurrealDB database"""
        self.session = aiohttp.ClientSession(base_url=self.db_url)
        
        # Initialize connection
        async with self.session.post('/sql', json={
            "ns": self.namespace,
            "db": self.database
        }) as response:
            if response.status != 200:
                raise ConnectionError(f"Failed to connect to SurrealDB: {response.status}")
    
    async def disconnect(self):
        """Disconnect from the database"""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def execute(self, query: str, params: Dict[str, Any] = None):
        """Execute a SurrealQL query"""
        if not self.session:
            await self.connect()
        
        async with self.session.post('/sql', data=query) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"Query failed: {response.status}")
    
    async def fetch_one(self, query: str, params: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """Fetch a single record"""
        result = await self.execute(query, params)
        if result and len(result) > 0:
            return result[0]
        return None
    
    async def fetch_all(self, query: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Fetch all records"""
        result = await self.execute(query, params)
        return result if result else []
    
    async def table_exists(self, table_name: str) -> bool:
        """Check if a table exists"""
        query = f"INFO FOR TABLE {table_name}"
        result = await self.execute(query)
        return result is not None and len(result) > 0