import pytest
from backend.models.workflow import Workflow, WorkflowCreate, WorkflowStatus, WorkflowNode, WorkflowNodeType

@pytest.fixture
def sample_workflow_node():
    """Sample workflow node for testing"""
    return WorkflowNode(
        id="node-1",
        type=WorkflowNodeType.AGENT,
        position={"x": 100, "y": 100},
        config={"agent_id": "test-agent-1"},
        connections=["node-2"]
    )

@pytest.fixture
def sample_workflow_data(sample_workflow_node):
    """Sample workflow data for testing"""
    return {
        "name": "Test Workflow",
        "description": "A test workflow for unit tests",
        "nodes": [sample_workflow_node],
        "config": {"max_execution_time": 300}
    }

@pytest.fixture
def sample_workflow_create(sample_workflow_data):
    """Sample workflow create model"""
    return WorkflowCreate(**sample_workflow_data)

@pytest.fixture
def sample_workflow(sample_workflow_data):
    """Sample workflow model"""
    return Workflow(
        id="test-workflow-1",
        status=WorkflowStatus.ACTIVE,
        **sample_workflow_data
    )