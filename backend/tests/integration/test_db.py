import pytest
import os
from backend.db.database import Database, init_db
from backend.core.config import Settings

@pytest.fixture
def test_db():
    """Create a test database"""
    test_db_url = "sqlite:///./test.db"
    db = Database(test_db_url)
    yield db
    # Cleanup
    if os.path.exists("./test.db"):
        os.remove("./test.db")

def test_database_connection(test_db):
    """Test database connection"""
    test_db.connect()
    assert test_db.connection is not None
    test_db.disconnect()

def test_database_table_creation(test_db):
    """Test database table creation"""
    init_db()
    
    # Check that tables were created
    assert test_db.table_exists("agents") == True
    assert test_db.table_exists("workflows") == True
    assert test_db.table_exists("plugins") == True

def test_database_crud_operations(test_db):
    """Test basic CRUD operations"""
    init_db()
    
    # Test insert
    test_db.execute(
        "INSERT INTO agents (id, name, description, model, capabilities, config, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ("test-agent-1", "Test Agent", "A test agent", "test-model", "[]", "{}", "active")
    )
    
    # Test select
    result = test_db.fetch_one("SELECT * FROM agents WHERE id = ?", ("test-agent-1",))
    assert result is not None
    assert result["name"] == "Test Agent"
    
    # Test update
    test_db.execute(
        "UPDATE agents SET name = ? WHERE id = ?",
        ("Updated Agent", "test-agent-1")
    )
    
    result = test_db.fetch_one("SELECT * FROM agents WHERE id = ?", ("test-agent-1",))
    assert result["name"] == "Updated Agent"
    
    # Test delete
    test_db.execute("DELETE FROM agents WHERE id = ?", ("test-agent-1",))
    result = test_db.fetch_one("SELECT * FROM agents WHERE id = ?", ("test-agent-1",))
    assert result is None