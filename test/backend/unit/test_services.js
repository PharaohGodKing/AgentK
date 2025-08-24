# Backend Services Unit Tests
import pytest
from unittest.mock import Mock, patch
from backend.services.agent_service import AgentService
from backend.services.llm_service import LLMService
from backend.services.workflow_service import WorkflowService
from backend.models.agent import Agent
from backend.models.workflow import Workflow

class TestAgentService:
    def test_create_agent(self):
        """Test creating a new agent"""
        service = AgentService()
        agent_data = {
            "name": "Test Agent",
            "description": "A test agent",
            "model": "lm_studio",
            "capabilities": ["research", "analysis"]
        }
        
        agent = service.create_agent(agent_data)
        
        assert agent.id is not None
        assert agent.name == "Test Agent"
        assert agent.description == "A test agent"
        assert agent.model == "lm_studio"
        assert "research" in agent.capabilities
        assert "analysis" in agent.capabilities
    
    def test_get_agent(self):
        """Test retrieving an agent by ID"""
        service = AgentService()
        agent_data = {
            "name": "Test Agent",
            "description": "A test agent",
            "model": "lm_studio"
        }
        
        created_agent = service.create_agent(agent_data)
        retrieved_agent = service.get_agent(created_agent.id)
        
        assert retrieved_agent is not None
        assert retrieved_agent.id == created_agent.id
        assert retrieved_agent.name == created_agent.name
    
    def test_update_agent(self):
        """Test updating an existing agent"""
        service = AgentService()
        agent_data = {
            "name": "Test Agent",
            "description": "A test agent",
            "model": "lm_studio"
        }
        
        agent = service.create_agent(agent_data)
        update_data = {"description": "Updated description"}
        
        updated_agent = service.update_agent(agent.id, update_data)
        
        assert updated_agent.description == "Updated description"
        assert updated_agent.name == "Test Agent"  # Should remain unchanged
    
    def test_delete_agent(self):
        """Test deleting an agent"""
        service = AgentService()
        agent_data = {
            "name": "Test Agent",
            "description": "A test agent",
            "model": "lm_studio"
        }
        
        agent = service.create_agent(agent_data)
        assert service.get_agent(agent.id) is not None
        
        service.delete_agent(agent.id)
        assert service.get_agent(agent.id) is None

class TestLLMService:
    @patch('backend.services.llm_service.requests.post')
    def test_send_message_to_lm_studio(self, mock_post):
        """Test sending a message to LM Studio"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Test response from LM Studio"}}]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        service = LLMService()
        response = service.send_message("lm_studio", "Test message", {})
        
        assert response == "Test response from LM Studio"
        mock_post.assert_called_once()
    
    @patch('backend.services.llm_service.requests.post')
    def test_send_message_to_ollama(self, mock_post):
        """Test sending a message to Ollama"""
        mock_response = Mock()
        mock_response.json.return_value = {"response": "Test response from Ollama"}
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        service = LLMService()
        response = service.send_message("ollama", "Test message", {})
        
        assert response == "Test response from Ollama"
        mock_post.assert_called_once()
    
    def test_handle_llm_error(self):
        """Test error handling when LLM service fails"""
        service = LLMService()
        
        with pytest.raises(Exception) as exc_info:
            service.send_message("invalid_model", "Test message", {})
        
        assert "Unsupported model" in str(exc_info.value)

class TestWorkflowService:
    def test_create_workflow(self):
        """Test creating a new workflow"""
        service = WorkflowService()
        workflow_data = {
            "name": "Test Workflow",
            "description": "A test workflow",
            "steps": [
                {
                    "agent": "research_assistant",
                    "action": "research_topic",
                    "inputs": ["query"],
                    "outputs": ["research_data"]
                }
            ]
        }
        
        workflow = service.create_workflow(workflow_data)
        
        assert workflow.id is not None
        assert workflow.name == "Test Workflow"
        assert workflow.description == "A test workflow"
        assert len(workflow.steps) == 1
        assert workflow.steps[0]["agent"] == "research_assistant"
    
    def test_execute_workflow(self):
        """Test executing a workflow"""
        service = WorkflowService()
        
        # Create a simple workflow
        workflow_data = {
            "name": "Test Workflow",
            "steps": [
                {
                    "agent": "test_agent",
                    "action": "test_action",
                    "inputs": ["input_data"],
                    "outputs": ["output_data"]
                }
            ]
        }
        
        workflow = service.create_workflow(workflow_data)
        
        # Mock the agent service to avoid actual LLM calls
        with patch('backend.services.workflow_service.AgentService') as mock_agent_service:
            mock_agent = Mock()
            mock_agent.perform_action.return_value = {"output_data": "test_result"}
            mock_agent_service.return_value.get_agent.return_value = mock_agent
            
            result = service.execute_workflow(workflow.id, {"input_data": "test_input"})
            
            assert result["output_data"] == "test_result"
            mock_agent.perform_action.assert_called_once_with(
                "test_action", {"input_data": "test_input"}
            )
    
    def test_get_workflow_execution_history(self):
        """Test retrieving workflow execution history"""
        service = WorkflowService()
        
        # Create and execute a workflow
        workflow_data = {
            "name": "Test Workflow",
            "steps": [
                {
                    "agent": "test_agent",
                    "action": "test_action",
                    "inputs": ["input_data"],
                    "outputs": ["output_data"]
                }
            ]
        }
        
        workflow = service.create_workflow(workflow_data)
        
        with patch('backend.services.workflow_service.AgentService') as mock_agent_service:
            mock_agent = Mock()
            mock_agent.perform_action.return_value = {"output_data": "test_result"}
            mock_agent_service.return_value.get_agent.return_value = mock_agent
            
            service.execute_workflow(workflow.id, {"input_data": "test_input"})
            
            history = service.get_execution_history(workflow.id)
            
            assert len(history) == 1
            assert history[0]["workflow_id"] == workflow.id
            assert history[0]["status"] == "completed"