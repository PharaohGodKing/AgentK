from pydantic import BaseModel, Field
from typing import Dict, Any, List
from datetime import datetime

class SystemMetrics(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.now)
    cpu_percent: float = Field(..., description="CPU usage percentage")
    memory_percent: float = Field(..., description="Memory usage percentage")
    disk_percent: float = Field(..., description="Disk usage percentage")
    network_io: Dict[str, int] = Field(..., description="Network I/O statistics")
    active_agents: int = Field(..., description="Number of active agents")
    total_requests: int = Field(..., description="Total API requests")

class AgentMetrics(BaseModel):
    agent_id: str = Field(..., description="The ID of the agent")
    timestamp: datetime = Field(default_factory=datetime.now)
    requests_processed: int = Field(..., description="Number of requests processed")
    average_response_time: float = Field(..., description="Average response time in seconds")
    success_rate: float = Field(..., description="Success rate (0.0 to 1.0)")
    resource_usage: Dict[str, Any] = Field(..., description="Resource usage statistics")