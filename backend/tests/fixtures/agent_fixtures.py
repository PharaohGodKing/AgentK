import pytest
from backend.models.agent import Agent, AgentCreate, AgentStatus, AgentCapability

@pytest.fixture
def sample_agent_data():
    """Sample agent data for testing"""
    return {
        "name": "Test Agent",
        "description": "A test agent for unit tests",
        "model": "test-model",
        "capabilities": [AgentCapability.WEB_RESEARCH, AgentCapability.CODE_GENERATION],
        "config": {"temperature": 0.7, "max_tokens": 1000}
    }

@pytest.fixture
def sample_agent_create(sample_agent_data):
    """Sample agent create model"""
    return AgentCreate(**sample_agent_data)

@pytest.fixture
def sample_agent(sample_agent_data):
    """Sample agent model"""
    return Agent(
        id="test-agent-1",
        status=AgentStatus.ACTIVE,
        **sample_agent_data
    )

@pytest.fixture
def multiple_agents():
    """Multiple sample agents for testing"""
    return [
        Agent(
            id=f"test-agent-{i}",
            name=f"Test Agent {i}",
            description=f"Test agent {i} description",
            model="test-model",
            capabilities=[AgentCapability.WEB_RESEARCH],
            config={"temperature": 0.7},
            status=AgentStatus.ACTIVE if i % 2 == 0 else AgentStatus.INACTIVE
        )
        for i in range(1, 6)
    ]