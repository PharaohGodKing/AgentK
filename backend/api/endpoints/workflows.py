from fastapi import APIRouter
from typing import List
from backend.models.workflow import Workflow

router = APIRouter()

@router.get("/", response_model=List[Workflow])
async def get_all_workflows():
    """
    Endpoint to retrieve a list of all defined workflows.
    """
    return []