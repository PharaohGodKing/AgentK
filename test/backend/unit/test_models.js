# Data Models Unit Tests
import pytest
from datetime import datetime
from backend.models.agent import Agent, AgentCapabilities
from backend.models.workflow import Workflow, WorkflowStep, WorkflowExecution
from backend.models.chat import ChatMessage, ChatSession
from backend.models.memory import MemoryItem

class TestAgentModel:
    def test_agent_creation(self):
        """Test creating an Agent instance"""
        agent = Agent(
            name="Test Agent",
            description="A test agent",
            model="lm_studio",
            capabilities=[AgentCapabilities.RESEARCH, AgentCapabilities.ANALYSIS]
        )
        
        assert agent.name == "Test Agent"
        assert agent.description == "A test agent"
        assert agent.model == "lm_studio"
        assert AgentCapabilities.RESEARCH in agent.capabilities
        assert AgentCapabilities.ANALYSIS in agent.capabilities
        assert agent.created_at is not None
        assert agent.updated_at is not None
        assert agent.status == "inactive"
    
    def test_agent_to_dict(self):
        """Test converting Agent to dictionary"""
        agent = Agent(
            name="Test Agent",
            description="A test agent",
            model="lm_studio"
        )
        
        agent_dict = agent.to_dict()
        
        assert agent_dict["name"] == "Test Agent"
        assert agent_dict["description"] == "A test agent"
        assert agent_dict["model"] == "lm_studio"
        assert "id" in agent_dict
        assert "created_at" in agent_dict
        assert "updated_at" in agent_dict
    
    def test_agent_from_dict(self):
        """Test creating Agent from dictionary"""
        agent_data = {
            "name": "Test Agent",
            "description": "A test agent",
            "model": "lm_studio",
            "capabilities": ["research", "analysis"]
        }
        
        agent = Agent.from_dict(agent_data)
        
        assert agent.name == "Test Agent"
        assert agent.description == "A test agent"
        assert agent.model == "lm_studio"
        assert "research" in agent.capabilities
        assert "analysis" in agent.capabilities

class TestWorkflowModel:
    def test_workflow_creation(self):
        """Test creating a Workflow instance"""
        step = WorkflowStep(
            agent="research_assistant",
            action="research_topic",
            inputs=["query"],
            outputs=["research_data"]
        )
        
        workflow = Workflow(
            name="Test Workflow",
            description="A test workflow",
            steps=[step]
        )
        
        assert workflow.name == "Test Workflow"
        assert workflow.description == "A test workflow"
        assert len(workflow.steps) == 1
        assert workflow.steps[0].agent == "research_assistant"
        assert workflow.steps[0].action == "research_topic"
    
    def test_workflow_execution(self):
        """Test creating a WorkflowExecution instance"""
        execution = WorkflowExecution(
            workflow_id="test_workflow_id",
            input_data={"query": "test query"},
            output_data={"result": "test result"},
            status="completed"
        )
        
        assert execution.workflow_id == "test_workflow_id"
        assert execution.input_data["query"] == "test query"
        assert execution.output_data["result"] == "test result"
        assert execution.status == "completed"
        assert execution.started_at is not None
        assert execution.completed_at is not None

class TestChatModels:
    def test_chat_message_creation(self):
        """Test creating a ChatMessage instance"""
        message = ChatMessage(
            session_id="test_session",
            content="Hello, agent!",
            sender="user",
            agent_id="test_agent"
        )
        
        assert message.session_id == "test_session"
        assert message.content == "Hello, agent!"
        assert message.sender == "user"
        assert message.agent_id == "test_agent"
        assert message.timestamp is not None
    
    def test_chat_session_creation(self):
        """Test creating a ChatSession instance"""
        session = ChatSession(
            user_id="test_user",
            agent_id="test_agent",
            title="Test Conversation"
        )
        
        assert session.user_id == "test_user"
        assert session.agent_id == "test_agent"
        assert session.title == "Test Conversation"
        assert session.created_at is not None
        assert session.updated_at is not None

class TestMemoryModel:
    def test_memory_item_creation(self):
        """Test creating a MemoryItem instance"""
        memory = MemoryItem(
            agent_id="test_agent",
            content="Important information to remember",
            importance=0.8,
            tags=["important", "reference"]
        )
        
        assert memory.agent_id == "test_agent"
        assert memory.content == "Important information to remember"
        assert memory.importance == 0.8
        assert "important" in memory.tags
        assert "reference" in memory.tags
        assert memory.created_at is not None
        assert memory.last_accessed is not None