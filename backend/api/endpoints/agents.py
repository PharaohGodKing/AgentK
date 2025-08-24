from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.database import get_db
from backend.models.agent import Agent, AgentCreate, AgentUpdate
from backend.services.agent_service import AgentService
from backend.core.security import get_current_user

router = APIRouter(prefix="/agents", tags=["agents"])
agent_service = AgentService()

@router.get("", response_model=List[Agent])
async def list_agents(
    skip: int = 0,
    limit: int = 333,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get list of all agents"""
    return await agent_service.get_agents(skip=skip, limit=limit, db=db)

@router.get("/{agent_id}", response_model=Agent)
async def get_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get specific agent by ID"""
    agent = await agent_service.get_agent(agent_id, db=db)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return agent

@router.post("", response_model=Agent, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new agent"""
    return await agent_service.create_agent(agent_data, db=db)

@router.put("/{agent_id}", response_model=Agent)
async def update_agent(
    agent_id: UUID,
    agent_data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing agent"""
    agent = await agent_service.update_agent(agent_id, agent_data, db=db)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an agent"""
    success = await agent_service.delete_agent(agent_id, db=db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )