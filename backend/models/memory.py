from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class MemoryBase(BaseModel):
    agent_id: str = Field(..., description="The ID of the agent this memory belongs to")
    content: str = Field(..., description="The memory content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    embedding: Optional[List[float]] = Field(default=None, description="Vector embedding of the memory")

class MemoryCreate(MemoryBase):
    pass

class MemoryUpdate(BaseModel):
    content: Optional[str] = Field(None, description="The memory content")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class Memory(MemoryBase):
    id: str = Field(..., description="Unique memory ID")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True

class MemoryResponse(Memory):
    pass