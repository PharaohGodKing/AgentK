from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class PluginStatus(str, Enum):
    INSTALLED = "installed"
    ACTIVATED = "activated"
    DEACTIVATED = "deactivated"
    ERROR = "error"

class PluginBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    version: str = Field(..., description="Plugin version")
    author: str = Field(..., description="Plugin author")
    capabilities: List[str] = Field(default_factory=list)
    config_schema: Dict[str, Any] = Field(default_factory=dict, description="Configuration schema")

class PluginCreate(PluginBase):
    pass

class PluginUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    version: Optional[str] = Field(None, description="Plugin version")
    config: Optional[Dict[str, Any]] = Field(None, description="Plugin configuration")
    status: Optional[PluginStatus] = None

class Plugin(PluginBase):
    id: str = Field(..., description="Unique plugin ID")
    status: PluginStatus = Field(default=PluginStatus.DEACTIVATED)
    config: Dict[str, Any] = Field(default_factory=dict, description="Current configuration")
    installed_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True

class PluginResponse(Plugin):
    pass