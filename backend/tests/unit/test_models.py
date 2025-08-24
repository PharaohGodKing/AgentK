import pytest
from datetime import datetime
from backend.models.agent import Agent, AgentCreate, AgentStatus, AgentCapability
from backend.models.workflow import Workflow, WorkflowCreate, WorkflowStatus, WorkflowNode, WorkflowNodeType

def test_agent_creation():
    """Test creating an agent model"""
    agent = Agent(
        id="test-agent-1",
        name="Test Agent",
        description="A test agent",
        model="test-model",
        capabilities=[AgentCapability.WEB_RESEARCH, AgentCapability.CODE_GENERATION],
        config={"temperature": 0.7},
        status=AgentStatus.ACTIVE
    )
    
    assert agent.id == "test-agent-1"
    assert agent.name == "Test Agent"
    assert AgentCapability.WEB_RESEARCH in agent.capabilities
    assert agent.status == AgentStatus.ACTIVE
    assert agent.config["temperature"] == 0.7

def test_agent_create_model():
    """Test creating an agent create model"""
    agent_data = AgentCreate(
        name="Test Agent",
        description="A test agent",
        model="test-model",
        capabilities=[AgentCapability.WEB_RESEARCH],
        config={"temperature": 0.7}
    )
    
    assert agent_data.name == "Test Agent"
    assert AgentCapability.WEB_RESEARCH in agent_data.capabilities
    assert agent_data.config["temperature"] == 0.7

def test_workflow_creation():
    """Test creating a workflow model"""
    node = WorkflowNode(
        id="node-1",
        type=WorkflowNodeType.AGENT,
        position={"x": 100, "y": 100},
        config={"agent_id": "test-agent-1"},
        connections=["node-2"]
    )
    
    workflow = Workflow(
        id="test-workflow-1",
        name="Test Workflow",
        description="A test workflow",
        nodes=[node],
        config={"max_execution_time": 300},
        status=WorkflowStatus.ACTIVE
    )
    
    assert workflow.id == "test-workflow-1"
    assert workflow.name == "Test Workflow"
    assert len(workflow.nodes) == 1
    assert workflow.nodes[0].type == WorkflowNodeType.AGENT
    assert workflow.status == WorkflowStatus.ACTIVE

def test_workflow_create_model():
    """Test creating a workflow create model"""
    node = WorkflowNode(
        id="node-1",
        type=WorkflowNodeType.AGENT,
        position={"x": 100, "y": 100},
        config={"agent_id": "test-agent-1"},
        connections=["node-2"]
    )
    
    workflow_data = WorkflowCreate(
        name="Test Workflow",
        description="A test workflow",
        nodes=[node],
        config={"max_execution_time": 300}
    )
    
    assert workflow_data.name == "Test Workflow"
    assert len(workflow_data.nodes) == 1
    assert workflow_data.nodes[0].type == WorkflowNodeType.AGENT
    assert workflow_data.config["max_execution_time"] == 300