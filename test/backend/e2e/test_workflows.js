# Full Workflow E2E Test
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_e2e.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override database dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    """Set up test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

class TestFullWorkflowE2E:
    def test_complete_workflow_lifecycle(self):
        """Test complete workflow lifecycle from creation to execution"""
        # Step 1: Create an agent
        agent_data = {
            "name": "E2E Test Agent",
            "description": "Agent for end-to-end testing",
            "model": "lm_studio",
            "capabilities": ["research", "analysis"]
        }
        
        agent_response = client.post("/api/agents", json=agent_data)
        assert agent_response.status_code == 200
        agent_id = agent_response.json()["id"]
        
        # Step 2: Create a workflow that uses the agent
        workflow_data = {
            "name": "E2E Test Workflow",
            "description": "Workflow for end-to-end testing",
            "steps": [
                {
                    "agent": agent_id,
                    "action": "test_action",
                    "inputs": ["input_data"],
                    "outputs": ["output_data"]
                }
            ]
        }
        
        workflow_response = client.post("/api/workflows", json=workflow_data)
        assert workflow_response.status_code == 200
        workflow_id = workflow_response.json()["id"]
        
        # Step 3: Execute the workflow
        # Mock the agent service to avoid actual LLM calls
        with pytest.MonkeyPatch().context() as m:
            # Mock the agent service to return a test response
            mock_response = {"output_data": "test result"}
            m.setattr("backend.services.agent_service.AgentService.perform_action", 
                     lambda self, action, inputs: mock_response)
            
            execution_data = {"input_data": "test input"}
            execution_response = client.post(
                f"/api/workflows/{workflow_id}/execute", 
                json=execution_data
            )
            
            assert execution_response.status_code == 202
            execution_id = execution_response.json()["execution_id"]
        
        # Step 4: Check execution status
        # Wait a bit for execution to complete (or check status endpoint if available)
        import time
        time.sleep(1)
        
        status_response = client.get(f"/api/workflows/executions/{execution_id}")
        # Might return 200 with status, or 404 if not found depending on implementation
        
        # Step 5: Get execution results
        history_response = client.get(f"/api/workflows/{workflow_id}/executions")
        assert history_response.status_code == 200
        executions = history_response.json()
        
        # Should have at least one execution
        assert len(executions) >= 1
        
        # Step 6: Verify the workflow can be retrieved
        workflow_get_response = client.get(f"/api/workflows/{workflow_id}")
        assert workflow_get_response.status_code == 200
        assert workflow_get_response.json()["name"] == "E2E Test Workflow"
        
        # Step 7: Clean up - delete workflow and agent
        delete_workflow_response = client.delete(f"/api/workflows/{workflow_id}")
        assert delete_workflow_response.status_code == 200
        
        delete_agent_response = client.delete(f"/api/agents/{agent_id}")
        assert delete_agent_response.status_code == 200
        
        # Verify they were deleted
        get_workflow_response = client.get(f"/api/workflows/{workflow_id}")
        assert get_workflow_response.status_code == 404
        
        get_agent_response = client.get(f"/api/agents/{agent_id}")
        assert get_agent_response.status_code == 404

    def test_chat_with_agent(self):
        """Test complete chat interaction with an agent"""
        # Step 1: Create an agent
        agent_data = {
            "name": "Chat Test Agent",
            "description": "Agent for chat testing",
            "model": "lm_studio"
        }
        
        agent_response = client.post("/api/agents", json=agent_data)
        assert agent_response.status_code == 200
        agent_id = agent_response.json()["id"]
        
        # Step 2: Send a chat message
        # Mock the LLM service to avoid actual LLM calls
        with pytest.MonkeyPatch().context() as m:
            m.setattr("backend.services.llm_service.LLMService.send_message", 
                     lambda self, model, message, options: "Mock response from agent")
            
            message_data = {
                "message": "Hello, agent!",
                "agent_id": agent_id
            }
            
            chat_response = client.post("/api/chat", json=message_data)
            assert chat_response.status_code == 200
            assert "message" in chat_response.json()
        
        # Step 3: Get chat history
        history_response = client.get("/api/chat/history")
        assert history_response.status_code == 200
        history = history_response.json()
        
        # Should have at least one message
        assert len(history) >= 1
        assert any(session["messages"] for session in history)
        
        # Step 4: Clean up - delete agent
        delete_response = client.delete(f"/api/agents/{agent_id}")
        assert delete_response.status_code == 200

    def test_agent_workflow_integration(self):
        """Test integration between agents and workflows"""
        # Step 1: Create multiple agents
        research_agent_data = {
            "name": "Research Agent",
            "description": "Handles research tasks",
            "model": "lm_studio",
            "capabilities": ["research"]
        }
        
        analysis_agent_data = {
            "name": "Analysis Agent",
            "description": "Handles analysis tasks",
            "model": "lm_studio",
            "capabilities": ["analysis"]
        }
        
        research_response = client.post("/api/agents", json=research_agent_data)
        assert research_response.status_code == 200
        research_agent_id = research_response.json()["id"]
        
        analysis_response = client.post("/api/agents", json=analysis_agent_data)
        assert analysis_response.status_code == 200
        analysis_agent_id = analysis_response.json()["id"]
        
        # Step 2: Create a workflow that uses both agents
        workflow_data = {
            "name": "Integrated Test Workflow",
            "description": "Workflow using multiple agents",
            "steps": [
                {
                    "agent": research_agent_id,
                    "action": "research_topic",
                    "inputs": ["query"],
                    "outputs": ["research_data"]
                },
                {
                    "agent": analysis_agent_id,
                    "action": "analyze_data",
                    "inputs": ["research_data"],
                    "outputs": ["insights"]
                }
            ]
        }
        
        workflow_response = client.post("/api/workflows", json=workflow_data)
        assert workflow_response.status_code == 200
        workflow_id = workflow_response.json()["id"]
        
        # Step 3: Verify workflow was created correctly
        workflow_get_response = client.get(f"/api/workflows/{workflow_id}")
        assert workflow_get_response.status_code == 200
        
        workflow = workflow_get_response.json()
        assert len(workflow["steps"]) == 2
        assert workflow["steps"][0]["agent"] == research_agent_id
        assert workflow["steps"][1]["agent"] == analysis_agent_id
        
        # Step 4: Clean up
        client.delete(f"/api/workflows/{workflow_id}")
        client.delete(f"/api/agents/{research_agent_id}")
        client.delete(f"/api/agents/{analysis_agent_id}")