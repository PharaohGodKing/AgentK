import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.config import Settings

@pytest.fixture
def test_client():
    """Create a test client"""
    return TestClient(app)

def test_root_endpoint(test_client):
    """Test the root endpoint"""
    response = test_client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "AgentK Collaborator System API"

def test_health_endpoint(test_client):
    """Test the health endpoint"""
    response = test_client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_api_docs_endpoint(test_client):
    """Test that API docs are available"""
    response = test_client.get("/api/docs")
    assert response.status_code == 200

def test_nonexistent_endpoint(test_client):
    """Test response for nonexistent endpoint"""
    response = test_client.get("/nonexistent")
    assert response.status_code == 404