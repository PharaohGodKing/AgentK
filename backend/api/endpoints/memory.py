from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from backend.services.memory_service import MemoryService

router = APIRouter()

@router.get("/{agent_id}")
async def get_agent_memory(agent_id: str, limit: int = 10, service: MemoryService = Depends(MemoryService)):
    """Get memory for a specific agent"""
    try:
        memories = await service.get_agent_memory(agent_id, limit)
        return {"agent_id": agent_id, "memories": memories}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching memory: {str(e)}"
        )

@router.post("/{agent_id}")
async def add_to_memory(agent_id: str, memory_data: Dict[str, Any], service: MemoryService = Depends(MemoryService)):
    """Add information to an agent's memory"""
    try:
        memory_id = await service.add_memory(agent_id, memory_data)
        return {"success": True, "memory_id": memory_id, "agent_id": agent_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding to memory: {str(e)}"
        )

@router.delete("/{memory_id}")
async def delete_memory(memory_id: str, service: MemoryService = Depends(MemoryService)):
    """Delete a specific memory"""
    try:
        success = await service.delete_memory(memory_id)
        return {"success": success, "message": "Memory deleted" if success else "Memory not found"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting memory: {str(e)}"
        )

@router.post("/{agent_id}/search")
async def search_memory(agent_id: str, query: str, limit: int = 5, service: MemoryService = Depends(MemoryService)):
    """Search through an agent's memory"""
    try:
        results = await service.search_memory(agent_id, query, limit)
        return {"agent_id": agent_id, "query": query, "results": results}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching memory: {str(e)}"
        )