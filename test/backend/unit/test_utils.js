# Utility Functions Unit Tests
import pytest
from datetime import datetime, timedelta
from backend.utils.llm_connector import LLMConnector
from backend.utils.file_utils import FileUtils
from backend.utils.validation import validate_email, validate_url
from backend.utils.serialization import serialize_json, deserialize_json

class TestLLMConnector:
    @pytest.mark.asyncio
    async def test_llm_connector_initialization(self):
        """Test LLMConnector initialization with different models"""
        # Test with LM Studio
        lm_connector = LLMConnector(model_type="lm_studio")
        assert lm_connector.base_url == "http://localhost:1234"
        
        # Test with Ollama
        ollama_connector = LLMConnector(model_type="ollama")
        assert ollama_connector.base_url == "http://localhost:11434"
    
    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires actual LLM service running")
    async def test_send_message(self):
        """Test sending a message to LLM service (requires service running)"""
        connector = LLMConnector(model_type="lm_studio")
        response = await connector.send_message("Test message")
        
        assert response is not None
        assert isinstance(response, str)

class TestFileUtils:
    def test_read_write_file(self, tmp_path):
        """Test reading and writing files"""
        test_file = tmp_path / "test.txt"
        test_content = "Hello, world!"
        
        # Write to file
        FileUtils.write_file(str(test_file), test_content)
        
        # Read from file
        content = FileUtils.read_file(str(test_file))
        
        assert content == test_content
    
    def test_file_exists(self, tmp_path):
        """Test checking if file exists"""
        test_file = tmp_path / "test.txt"
        
        # File doesn't exist yet
        assert not FileUtils.file_exists(str(test_file))
        
        # Create file
        test_file.write_text("test")
        assert FileUtils.file_exists(str(test_file))
    
    def test_create_directory(self, tmp_path):
        """Test creating directory"""
        test_dir = tmp_path / "test_dir"
        
        FileUtils.create_directory(str(test_dir))
        assert test_dir.exists() and test_dir.is_dir()

class TestValidationUtils:
    def test_validate_email(self):
        """Test email validation"""
        assert validate_email("test@example.com") is True
        assert validate_email("user.name@domain.co.uk") is True
        assert validate_email("invalid") is False
        assert validate_email("@domain.com") is False
        assert validate_email("test@") is False
    
    def test_validate_url(self):
        """Test URL validation"""
        assert validate_url("https://example.com") is True
        assert validate_url("http://localhost:3000") is True
        assert validate_url("ftp://example.com") is True
        assert validate_url("invalid") is False
        assert validate_url("example.com") is False  # Missing scheme

class TestSerializationUtils:
    def test_serialize_deserialize_json(self):
        """Test JSON serialization and deserialization"""
        test_data = {
            "string": "hello",
            "number": 42,
            "boolean": True,
            "list": [1, 2, 3],
            "nested": {
                "key": "value"
            }
        }
        
        # Serialize to JSON
        json_str = serialize_json(test_data)
        assert isinstance(json_str, str)
        
        # Deserialize from JSON
        deserialized = deserialize_json(json_str)
        assert deserialized == test_data
    
    def test_serialize_with_custom_encoder(self):
        """Test JSON serialization with custom encoder"""
        from datetime import datetime
        
        test_data = {
            "timestamp": datetime(2023, 11, 15, 10, 30, 0),
            "value": "test"
        }
        
        # This should work with custom encoder that handles datetime
        json_str = serialize_json(test_data)
        assert "2023-11-15T10:30:00" in json_str
    
    def test_deserialize_invalid_json(self):
        """Test handling invalid JSON during deserialization"""
        invalid_json = "{invalid: json}"
        
        with pytest.raises(ValueError):
            deserialize_json(invalid_json)