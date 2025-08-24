# API Integration Tests
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.config import settings
from backend.db.database import get_db
from backend.models.agent import Agent
from backend.models.workflow import Workflow

client = TestClient(app)

# Override database dependency for testing
@pytest.fixture(autouse=True)
def override_db():
    from backend.db.database import SessionLocal
    from backend.main import app
    
    def get_test_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = get_test_db
    yield
    app.dependency_overrides.clear()

class TestAgentsAPI:
    def test_create_agent(self):
        """Test creating an agent via API"""
        agent_data = {
            "name": "API Test Agent",
            "description": "An agent created via API test",
            "model": "lm_studio",
            "capabilities": ["research", "analysis"]
        }
        
        response = client.post("/api/agents", json=agent_data)
        
        assert response.status_code == 200
        assert response.json()["name"] == "API Test Agent"
        assert response.json()["description"] == "An agent created via API test"
        assert "id" in response.json()
    
    def test_get_agents(self):
        """Test retrieving all agents via API"""
        # First create an agent
        agent_data = {
            "name": "Test Agent for List",
            "description": "Test agent",
            "model": "lm_studio"
        }
        client.post("/api/agents", json=agent_data)
        
        # Then get all agents
        response = client.get("/api/agents")
        
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) > 0
    
    def test_get_agent_by_id(self):
        """Test retrieving a specific agent by ID"""
        # First create an agent
        agent_data = {
            "name": "Test Agent for Get",
            "description": "Test agent",
            "model": "lm_studio"
        }
        create_response = client.post("/api/agents", json=agent_data)
        agent_id = create_response.json()["id"]
        
        # Then get that specific agent
        response = client.get(f"/api/agents/{agent_id}")
        
        assert response.status_code == 200
        assert response.json()["id"] == agent_id
        assert response.json()["name"] == "Test Agent for Get"
    
    def test_update_agent(self):
        """Test updating an agent via API"""
        # First create an agent
        agent_data = {
            "name": "Test Agent for Update",
            "description": "Original description",
            "model": "lm_studio"
        }
        create_response = client.post("/api/agents", json=agent_data)
        agent_id = create_response.json()["id"]
        
        # Then update the agent
        update_data = {"description": "Updated description"}
        response = client.put(f"/api/agents/{agent_id}", json=update_data)
        
        assert response.status_code == 200
        assert response.json()["description"] == "Updated description"
        
        # Verify the update persisted
        get_response = client.get(f"/api/agents/{agent_id}")
        assert get_response.json()["description"] == "Updated description"
    
    def test_delete_agent(self):
        """Test deleting an agent via API"""
        # First create an agent
        agent_data = {
            "name": "Test Agent for Delete",
            "description": "Test agent",
            "model": "lm_studio"
        }
        create_response = client.post("/api/agents", json=agent_data)
        agent_id = create_response.json()["id"]
        
        # Verify agent exists
        get_response = client.get(f"/api/agents/{agent_id}")
        assert get_response.status_code == 200
        
        # Delete the agent
        delete_response = client.delete(f"/api/agents/{agent_id}")
        assert delete_response.status_code == 200
        
        # Verify agent no longer exists
        get_response = client.get(f"/api/agents/{agent_id}")
        assert get_response.status_code == 404

class TestWorkflowsAPI:
    def test_create_workflow(self):
        """Test creating a workflow via API"""
        workflow_data = {
            "name": "API Test Workflow",
            "description": "A workflow created via API test",
            "steps": [
                {
                    "agent": "research_assistant",
                    "action": "research_topic",
                    "inputs": ["query"],
                    "outputs": ["research_data"]
                }
            ]
        }
        
        response = client.post("/api/workflows", json=workflow_data)
        
        assert response.status_code == 200
        assert response.json()["name"] == "API Test Workflow"
        assert response.json()["description"] == "A workflow created via API test"
        assert "id" in response.json()
        assert len(response.json()["steps"]) == 1
    
    def test_execute_workflow(self):
        """Test executing a workflow via API"""
        # First create a workflow
        workflow_data = {
            "name": "Test Workflow for Execution",
            "description": "Test workflow",
            "steps": [
                {
                    "agent": "test_agent",
                    "action": "test_action",
                    "inputs": ["input_data"],
                    "outputs": ["output_data"]
                }
            ]
        }
        create_response = client.post("/api/workflows", json=workflow_data)
        workflow_id = create_response.json()["id"]
        
        # Mock the agent service to avoid actual LLM calls
        with pytest.MonkeyPatch().context() as m:
            m.setattr("backend.api.endpoints.workflows.AgentService", lambda: None)
            
            # Execute the workflow
            execution_data = {"input_data": "test input"}
            response = client.post(f"/api/workflows/{workflow_id}/execute", json=execution_data)
            
            # Should return accepted status (execution started)
            assert response.status_code == 202
            assert "execution_id" in response.json()
    
    def test_get_workflow_execution_history(self):
        """Test retrieving workflow execution history via API"""
        # First create a workflow
        workflow_data = {
            "name": "Test Workflow for History",
            "description": "Test workflow",
            "steps": [
                {
                    "agent": "test_agent",
                    "action": "test_action",
                    "inputs": ["input_data"],
                    "outputs": ["output_data"]
                }
            ]
        }
        create_response = client.post("/api/workflows", json=workflow_data)
        workflow_id = create_response.json()["id"]
        
        # Get execution history
        response = client.get(f"/api/workflows/{workflow_id}/executions")
        
        assert response.status_code == 200
        assert isinstance(response.json(), list)

class TestChatAPI:
    def test_send_chat_message(self):
        """Test sending a chat message via API"""
        # First create an agent
        agent_data = {
            "name": "Test Chat Agent",
            "description": "Test agent for chat",
            "model": "lm_studio"
        }
        agent_response = client.post("/api/agents", json=agent_data)
        agent_id = agent_response.json()["id"]
        
        # Mock the LLM service to avoid actual LLM calls
        with pytest.MonkeyPatch().context() as m:
            m.setattr("backend.api.endpoints.chat.LLMService", lambda: None)
            
            # Send a chat message
            message_data = {
                "message": "Hello, agent!",
                "agent_id": agent_id
            }
            response = client.post("/api/chat", json=message_data)
            
            assert response.status_code == 200
            assert "message" in response.json()
            assert "agent_id" in response.json()
    
    def test_get_chat_history(self):
        """Test retrieving chat history via API"""
        # Create a session first by sending a message
        agent_data = {
            "name": "Test History Agent",
            "description": "Test agent for history",
            "model": "lm_studio"
        }
        agent_response = client.post("/api/agents", json=agent_data)
        agent_id = agent_response.json()["id"]
        
        # Mock the LLM service
        with pytest.MonkeyPatch().context() as m:
            m.setattr("backend.api.endpoints.chat.LLMService", lambda: None)
            
            # Send a message to create a session
            message_data = {
                "message": "Test message for history",
                "agent_id": agent_id
            }
            client.post("/api/chat", json=message_data)
            
            # Get chat history
            response = client.get("/api/chat/history")
            
            assert response.status_code == 200
            assert isinstance(response.json(), list)
            assert len(response.json()) > 0