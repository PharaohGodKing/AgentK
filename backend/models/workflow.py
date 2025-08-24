from pydantic import BaseModel
from typing import List, Dict

class WorkflowStep(BaseModel):
    id: str
    name: str
    tool: str
    params: Dict

class Workflow(BaseModel):
    id: str
    name: str
    description: str
    steps: List[WorkflowStep]