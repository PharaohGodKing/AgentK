from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime
from uuid import UUID, uuid4

class AgentStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BUSY = "busy"
    ERROR = "error"

class AgentCapability(str, Enum):
    WEB_RESEARCH = "web_research"
    CODE_GENERATION = "code_generation"
    DATA_ANALYSIS = "data_analysis"
    CONTENT_WRITING = "content_writing"
    SUMMARIZATION = "summarization"
    TRANSLATION = "translation"
    DEBUGGING = "debugging"

class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    avatar: str = Field("🤖", max_length=10)
    model: str = Field(..., description="Model ID to use for this agent")
    capabilities: List[AgentCapability] = Field(default_factory=list)

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    avatar: Optional[str] = Field(None, max_length=10)
    model: Optional[str] = Field(None, description="Model ID to use for this agent")
    capabilities: Optional[List[AgentCapability]] = None
    status: Optional[AgentStatus] = None

class Agent(AgentBase):
    id: UUID = Field(default_factory=uuid4)
    status: AgentStatus = AgentStatus.OFFLINE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }