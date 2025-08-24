from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from backend.services.llm_service import LLMService

router = APIRouter()

@router.get("/")
async def get_available_models(llm_service: LLMService = Depends(LLMService)):
    """Get available LLM models"""
    try:
        models = await llm_service.get_available_models()
        return {"models": models}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching models: {str(e)}"
        )

@router.get("/status")
async def get_model_status(llm_service: LLMService = Depends(LLMService)):
    """Get status of model connections"""
    try:
        status = await llm_service.get_model_status()
        return {"status": status}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching model status: {str(e)}"
        )
@router.post("/test-connection")
async def test_model_connection(model_type: str, model_config: Dict[str, Any], llm_service: LLMService = Depends(LLMService)):
    """Test connection to a specific model"""
    try:
        success = await llm_service.test_connection(model_type, model_config)
        return {"success": success, "message": "Connection successful" if success else "Connection failed"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error testing connection: {str(e)}"
        )

@router.post("/switch")
async def switch_active_model(model_type: str, model_name: str, llm_service: LLMService = Depends(LLMService)):
    """Switch the active model"""
    try:
        success = await llm_service.switch_model(model_type, model_name)
        return {"success": success, "message": f"Switched to {model_name} on {model_type}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error switching model: {str(e)}"
        )