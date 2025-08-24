from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.database import get_db
from backend.models.chat import ChatMessage, ChatResponse
from backend.services.agent_service import AgentService
from backend.services.llm_service import LLMService
from backend.core.security import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])
agent_service = AgentService()
llm_service = LLMService()

@router.post("/{agent_id}", response_model=ChatResponse)
async def chat_with_agent(
    agent_id: UUID,
    message: ChatMessage,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Send a message to an agent and get response"""
    agent = await agent_service.get_agent(agent_id, db=db)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    response = await llm_service.chat_with_agent(agent, message)
    return response

@router.get("/{agent_id}/history", response_model=list)
async def get_chat_history(
    agent_id: UUID,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get chat history for an agent"""
    # TODO: Implement chat history retrieval from database
    return []