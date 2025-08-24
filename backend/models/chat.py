from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

class MessageRole(str, Enum):
    USER = "user"
    AGENT = "agent"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    agent_id: Optional[UUID] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatResponse(BaseModel):
    message_id: UUID = Field(default_factory=uuid4)
    agent_id: UUID
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    usage: Optional[dict] = None  # Token usage info

    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }