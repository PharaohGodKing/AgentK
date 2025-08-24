from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings
from backend.core.config import settings
from backend.models.memory import Memory, MemoryCreate
import uuid

class MemoryService:
    def __init__(self):
        self.chroma_client = chromadb.Client(
            Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=settings.CHROMA_PATH
            )
        )
        
        # Create or get collection for agent memories
        self.collection = self.chroma_client.get_or_create_collection("agent_memories")
    
    async def get_agent_memory(self, agent_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get memory for a specific agent"""
        try:
            results = self.collection.get(
                where={"agent_id": agent_id},
                limit=limit,
                include=["metadatas", "documents"]
            )
            
            memories = []
            for i in range(len(results["ids"])):
                memories.append({
                    "id": results["ids"][i],
                    "content": results["documents"][i],
                    "metadata": results["metadatas"][i],
                    "agent_id": agent_id
                })
            
            return memories
        except Exception as e:
            print(f"Error getting agent memory: {str(e)}")
            return []
    
    async def add_memory(self, agent_id: str, memory_data: Dict[str, Any]) -> str:
        """Add information to an agent's memory"""
        try:
            memory_id = str(uuid.uuid4())
            content = memory_data.get("content", "")
            metadata = memory_data.get("metadata", {})
            metadata["agent_id"] = agent_id
            
            self.collection.add(
                documents=[content],
                metadatas=[metadata],
                ids=[memory_id]
            )
            
            return memory_id
        except Exception as e:
            print(f"Error adding to memory: {str(e)}")
            raise
    
    async def delete_memory(self, memory_id: str) -> bool:
        """Delete a specific memory"""
        try:
            self.collection.delete(ids=[memory_id])
            return True
        except Exception as e:
            print(f"Error deleting memory: {str(e)}")
            return False
    
    async def search_memory(self, agent_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search through an agent's memory"""
        try:
            results = self.collection.query(
                query_texts=[query],
                where={"agent_id": agent_id},
                n_results=limit,
                include=["metadatas", "documents", "distances"]
            )
            
            search_results = []
            for i in range(len(results["ids"][0])):
                search_results.append({
                    "id": results["ids"][0][i],
                    "content": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i],
                    "agent_id": agent_id
                })
            
            return search_results
        except Exception as e:
            print(f"Error searching memory: {str(e)}")
            return []
    
    async def clear_agent_memory(self, agent_id: str) -> bool:
        """Clear all memory for a specific agent"""
        try:
            results = self.collection.get(where={"agent_id": agent_id})
            if results["ids"]:
                self.collection.delete(ids=results["ids"])
            return True
        except Exception as e:
            print(f"Error clearing agent memory: {str(e)}")
            return False