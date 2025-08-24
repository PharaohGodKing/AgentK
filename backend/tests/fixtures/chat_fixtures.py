import pytest
from datetime import datetime
from backend.models.chat import ChatMessage, ChatRequest, ChatResponse

@pytest.fixture
def sample_chat_message():
    """Sample chat message for testing"""
    return ChatMessage(
        role="user",
        content="Hello, how are you?",
        timestamp=datetime.now()
    )

@pytest.fixture
def sample_chat_request(sample_chat_message):
    """Sample chat request for testing"""
    return ChatRequest(
        agent_id="test-agent-1",
        message="Hello, how are you?",
        history=[sample_chat_message]
    )

@pytest.fixture
def sample_chat_response():
    """Sample chat response for testing"""
    return ChatResponse(
        agent_id="test-agent-1",
        message="I'm doing well, thank you!",
        timestamp=datetime.now(),
        success=True
    )