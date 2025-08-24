# Database Integration Tests
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.database import Base, get_db
from backend.models.agent import Agent
from backend.models.workflow import Workflow, WorkflowStep
from backend.models.chat import ChatSession, ChatMessage

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test"""
    # Create the tables
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop the tables
        Base.metadata.drop_all(bind=engine)

class TestAgentDatabase:
    def test_create_agent_in_db(self, test_db):
        """Test creating an agent in the database"""
        agent = Agent(
            name="DB Test Agent",
            description="An agent created for DB testing",
            model="lm_studio",
            capabilities=["research", "analysis"]
        )
        
        test_db.add(agent)
        test_db.commit()
        test_db.refresh(agent)
        
        assert agent.id is not None
        assert agent.name == "DB Test Agent"
        assert agent.description == "An agent created for DB testing"
        assert agent.model == "lm_studio"
        assert "research" in agent.capabilities
        assert "analysis" in agent.capabilities
    
    def test_read_agent_from_db(self, test_db):
        """Test reading an agent from the database"""
        # First create an agent
        agent = Agent(
            name="Test Agent for Reading",
            description="Test agent",
            model="lm_studio"
        )
        test_db.add(agent)
        test_db.commit()
        test_db.refresh(agent)
        
        # Then read it back
        retrieved_agent = test_db.query(Agent).filter(Agent.id == agent.id).first()
        
        assert retrieved_agent is not None
        assert retrieved_agent.id == agent.id
        assert retrieved_agent.name == "Test Agent for Reading"
        assert retrieved_agent.description == "Test agent"
    
    def test_update_agent_in_db(self, test_db):
        """Test updating an agent in the database"""
        # First create an agent
        agent = Agent(
            name="Test Agent for Update",
            description="Original description",
            model="lm_studio"
        )
        test_db.add(agent)
        test_db.commit()
        test_db.refresh(agent)
        
        # Update the agent
        agent.description = "Updated description"
        test_db.commit()
        test_db.refresh(agent)
        
        # Verify the update
        updated_agent = test_db.query(Agent).filter(Agent.id == agent.id).first()
        assert updated_agent.description == "Updated description"
    
    def test_delete_agent_from_db(self, test_db):
        """Test deleting an agent from the database"""
        # First create an agent
        agent = Agent(
            name="Test Agent for Delete",
            description="Test agent",
            model="lm_studio"
        )
        test_db.add(agent)
        test_db.commit()
        test_db.refresh(agent)
        
        # Verify agent exists
        assert test_db.query(Agent).filter(Agent.id == agent.id).first() is not None
        
        # Delete the agent
        test_db.delete(agent)
        test_db.commit()
        
        # Verify agent no longer exists
        assert test_db.query(Agent).filter(Agent.id == agent.id).first() is None

class TestWorkflowDatabase:
    def test_create_workflow_in_db(self, test_db):
        """Test creating a workflow in the database"""
        step = WorkflowStep(
            agent="research_assistant",
            action="research_topic",
            inputs=["query"],
            outputs=["research_data"]
        )
        
        workflow = Workflow(
            name="DB Test Workflow",
            description="A workflow created for DB testing",
            steps=[step]
        )
        
        test_db.add(workflow)
        test_db.commit()
        test_db.refresh(workflow)
        
        assert workflow.id is not None
        assert workflow.name == "DB Test Workflow"
        assert workflow.description == "A workflow created for DB testing"
        assert len(workflow.steps) == 1
        assert workflow.steps[0].agent == "research_assistant"
    
    def test_workflow_with_multiple_steps(self, test_db):
        """Test creating a workflow with multiple steps"""
        steps = [
            WorkflowStep(
                agent="research_assistant",
                action="research_topic",
                inputs=["query"],
                outputs=["research_data"]
            ),
            WorkflowStep(
                agent="analyst",
                action="analyze_data",
                inputs=["research_data"],
                outputs=["insights"]
            )
        ]
        
        workflow = Workflow(
            name="Multi-step Workflow",
            description="Workflow with multiple steps",
            steps=steps
        )
        
        test_db.add(workflow)
        test_db.commit()
        test_db.refresh(workflow)
        
        assert len(workflow.steps) == 2
        assert workflow.steps[0].agent == "research_assistant"
        assert workflow.steps[1].agent == "analyst"

class TestChatDatabase:
    def test_create_chat_session(self, test_db):
        """Test creating a chat session in the database"""
        session = ChatSession(
            user_id="test_user",
            agent_id="test_agent",
            title="Test Conversation"
        )
        
        test_db.add(session)
        test_db.commit()
        test_db.refresh(session)
        
        assert session.id is not None
        assert session.user_id == "test_user"
        assert session.agent_id == "test_agent"
        assert session.title == "Test Conversation"
    
    def test_add_message_to_session(self, test_db):
        """Test adding messages to a chat session"""
        # First create a session
        session = ChatSession(
            user_id="test_user",
            agent_id="test_agent",
            title="Test Conversation"
        )
        test_db.add(session)
        test_db.commit()
        test_db.refresh(session)
        
        # Add messages to the session
        messages = [
            ChatMessage(
                session_id=session.id,
                content="Hello, agent!",
                sender="user",
                agent_id="test_agent"
            ),
            ChatMessage(
                session_id=session.id,
                content="Hello, user! How can I help?",
                sender="agent",
                agent_id="test_agent"
            )
        ]
        
        for message in messages:
            test_db.add(message)
        test_db.commit()
        
        # Verify messages were added
        message_count = test_db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).count()
        
        assert message_count == 2
        
        # Verify session was updated
        test_db.refresh(session)
        assert session.updated_at is not None