import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from backend.services.agent_service import AgentService
from backend.services.llm_service import LLMService
from backend.models.agent import Agent, AgentCreate, AgentStatus, AgentCapability

@pytest.fixture
def mock_db():
    """Create a mock database"""
    db = MagicMock()
    db.fetch_one = AsyncMock()
    db.fetch_all = AsyncMock()
    db.execute = AsyncMock()
    return db

@pytest.mark.asyncio
async def test_agent_service_get_agent(mock_db):
    """Test getting an agent by ID"""
    # Mock database response
    mock_db.fetch_one.return_value = {
        "id": "test-agent-1",
        "name": "Test Agent",
        "description": "A test agent",
        "model": "test-model",
        "capabilities": '["web_research", "code_generation"]',
        "config": '{"temperature": 0.7}',
        "status": "active",
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
    }
    
    service = AgentService()
    service.db = mock_db
    
    agent = await service.get_agent("test-agent-1")
    
    assert agent is not None
    assert agent.id == "test-agent-1"
    assert agent.name == "Test Agent"
    assert AgentCapability.WEB_RESEARCH in agent.capabilities
    assert agent.status == AgentStatus.ACTIVE

@pytest.mark.asyncio
async def test_llm_service_generate_response():
    """Test generating a response from LLM service"""
    service = LLMService()
    
    # Mock the API calls
    with patch('aiohttp.ClientSession.post') as mock_post:
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Test response"}}]
        }
        mock_post.return_value.__aenter__.return_value = mock_response
        
        response = await service.generate_response("test-agent", "Hello")
        
        assert "Test response" in response

@pytest.mark.asyncio
async def test_llm_service_get_available_models():
    """Test getting available models"""
    service = LLMService()
    
    # Mock the API calls for both LM Studio and Ollama
    with patch('aiohttp.ClientSession.get') as mock_get:
        # Mock LM Studio response
        mock_response_lm = AsyncMock()
        mock_response_lm.status = 200
        mock_response_lm.json.return_value = {
            "data": [{"id": "test-model-1"}]
        }
        
        # Mock Ollama response  
        mock_response_ollama = AsyncMock()
        mock_response_ollama.status = 200
        mock_response_ollama.json.return_value = {
            "models": [{"name": "test-model-2"}]
        }
        
        # Make mock_get return different responses based on URL
        def side_effect(*args, **kwargs):
            url = args[0]
            if "lmstudio" in url:
                return mock_response_lm
            else:
                return mock_response_ollama
        
        mock_get.side_effect = side_effect
        
        models = await service.get_available_models()
        
        # Should have models from both services
        assert len(models) >= 2
        assert any(m["type"] == "lmstudio" for m in models)
        assert any(m["type"] == "ollama" for m in models)