# Plugin Development Guide

## 🔌 Understanding Plugins

Plugins extend AgentK's capabilities by adding new functionality, integrations, and custom processing steps.

### Plugin Types
- **Core Plugins**: Built-in functionality
- **Custom Plugins**: User-created extensions  
- **Integration Plugins**: Third-party service connectors
- **Utility Plugins**: Helper functions and tools

## 🚀 Creating Your First Plugin

### Basic Plugin Structure
```python
from agentk.plugins import BasePlugin

class MyFirstPlugin(BasePlugin):
    name = "my_first_plugin"
    description = "My first custom plugin for AgentK"
    version = "1.0.0"
    
    async def execute(self, input_data: dict) -> dict:
        """Main execution method"""
        return {"result": f"Processed: {input_data}"}

Plugin Registration
python

# In your plugin module
from agentk.plugin_manager import plugin_manager

plugin_manager.register(MyFirstPlugin())

Configuration File
yaml

# plugins/my_plugin/config.yaml
name: "my_plugin"
enabled: true
config:
  api_key: "${MY_API_KEY}"
  timeout: 30
  max_retries: 3

⚙️ Plugin Configuration
Basic Configuration
python

class ConfigurablePlugin(BasePlugin):
    def __init__(self, config: dict):
        self.api_key = config.get("api_key")
        self.timeout = config.get("timeout", 30)
        
    async def execute(self, input_data: dict):
        # Use configured values
        pass

Environment Variables
python

import os

class SecurePlugin(BasePlugin):
    def __init__(self):
        self.api_key = os.getenv("API_KEY")
        self.secret = os.getenv("API_SECRET")

🎯 Plugin Types
Agent Capability Plugins
python

class ResearchPlugin(BasePlugin):
    name = "web_research"
    description = "Web research capabilities"
    
    async def execute(self, query: str, max_results: int = 5) -> List[dict]:
        """Perform web research"""
        results = await self._search_web(query, max_results)
        return {"results": results}

Utility Plugins
python

class CalculatorPlugin(BasePlugin):
    name = "calculator"
    description = "Mathematical calculations"
    
    async def execute(self, expression: str) -> float:
        """Evaluate mathematical expression"""
        return eval(expression)  # Note: Use safe eval in production

Integration Plugins
python

class SlackPlugin(BasePlugin):
    name = "slack_integration"
    description = "Slack messaging integration"
    
    async def execute(self, channel: str, message: str) -> bool:
        """Send message to Slack"""
        success = await self._send_to_slack(channel, message)
        return {"success": success}

🔧 Advanced Plugin Features
Plugin Dependencies
python

class AdvancedPlugin(BasePlugin):
    dependencies = ["database", "cache"]
    
    def __init__(self, database, cache):
        self.db = database
        self.cache = cache

Plugin Events
python

class EventPlugin(BasePlugin):
    async def on_message_received(self, message: dict):
        """Handle incoming messages"""
        pass
        
    async def on_agent_start(self, agent_id: str):
        """Handle agent startup"""
        pass

Plugin Hooks
python

class HookPlugin(BasePlugin):
    hooks = ["before_message_send", "after_response_receive"]
    
    async def before_message_send(self, message: dict) -> dict:
        """Modify messages before sending"""
        message["processed"] = True
        return message

📊 Data Processing Plugins
Input Validation
python

class ValidationPlugin(BasePlugin):
    async def execute(self, data: dict) -> dict:
        """Validate and sanitize input data"""
        if not data.get("query"):
            raise ValueError("Query parameter required")
            
        # Sanitize input
        sanitized = self._sanitize_input(data["query"])
        return {"sanitized_query": sanitized}

Data Transformation
python

class TransformPlugin(BasePlugin):
    async def execute(self, data: dict, format: str = "json") -> dict:
        """Transform data between formats"""
        if format == "json":
            return json.dumps(data)
        elif format == "xml":
            return self._dict_to_xml(data)

Batch Processing
python

class BatchPlugin(BasePlugin):
    async def execute_batch(self, items: List[dict]) -> List[dict]:
        """Process multiple items efficiently"""
        results = []
        for item in items:
            result = await self.process_item(item)
            results.append(result)
        return results

🔌 Integration Examples
Web API Integration
python

class WeatherPlugin(BasePlugin):
    name = "weather"
    
    async def execute(self, location: str) -> dict:
        """Get weather data for location"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.weather.com/{location}",
                timeout=30
            )
            return response.json()

Database Integration
python

class DatabasePlugin(BasePlugin):
    def __init__(self, db_url: str):
        self.engine = create_async_engine(db_url)
        
    async def execute(self, query: str) -> List[dict]:
        """Execute database query"""
        async with self.engine.connect() as conn:
            result = await conn.execute(text(query))
            return [dict(row) for row in result]

File System Integration
python

class FilePlugin(BasePlugin):
    async def execute(self, operation: str, path: str, data: str = None) -> dict:
        """File operations"""
        if operation == "read":
            with open(path, 'r') as f:
                return {"content": f.read()}
        elif operation == "write":
            with open(path, 'w') as f:
                f.write(data)
            return {"success": True}

🧪 Testing Plugins
Unit Tests
python

import pytest
from my_plugin import MyPlugin

@pytest.mark.asyncio
async def test_plugin_execution():
    plugin = MyPlugin()
    result = await plugin.execute({"input": "test"})
    assert "result" in result
    assert result["result"] == "Processed: test"

Integration Tests
python

@pytest.mark.asyncio
async def test_plugin_integration():
    # Test with actual dependencies
    plugin = MyPlugin(config={"api_key": "test"})
    async with AsyncClient() as client:
        result = await plugin.execute_with_client(client, {"input": "test"})
        assert result["success"] == True

Mocking Dependencies
python

@pytest.mark.asyncio
async def test_plugin_with_mocks():
    plugin = MyPlugin()
    
    # Mock external service
    with patch('my_plugin.requests.get') as mock_get:
        mock_get.return_value.json.return_value = {"data": "mocked"}
        
        result = await plugin.execute({"input": "test"})
        assert result["data"] == "mocked"

🚀 Deployment
Plugin Packaging
python

# setup.py
from setuptools import setup, find_packages

setup(
    name="agentk-weather-plugin",
    version="1.0.0",
    packages=find_packages(),
    entry_points={
        'agentk.plugins': [
            'weather = weather_plugin:WeatherPlugin'
        ]
    }
)

Configuration Management
yaml

# config/plugins.yaml
weather:
  enabled: true
  config:
    api_key: "${WEATHER_API_KEY}"
    cache_ttl: 3600

calculator:
  enabled: true
  config: {}

Dependency Management
txt

# requirements.txt
requests>=2.25.0
aiohttp>=3.8.0
pydantic>=1.10.0

🔒 Security Considerations
Input Validation
python

class SecurePlugin(BasePlugin):
    async def execute(self, input_data: dict) -> dict:
        """Secure input handling"""
        # Validate input
        if not self._is_valid_input(input_data):
            raise SecurityError("Invalid input")
            
        # Sanitize output
        result = self._process(input_data)
        return self._sanitize_output(result)

Secret Management
python

class SecureConfigPlugin(BasePlugin):
    def __init__(self):
        # Get secrets from secure storage
        self.api_key = self._get_secret("api_key")
        self.secret = self._get_secret("api_secret")

Rate Limiting
python

class RateLimitedPlugin(BasePlugin):
    def __init__(self):
        self.rate_limiter = RateLimiter(100, 3600)  # 100 requests/hour
        
    async def execute(self, input_data: dict) -> dict:
        """Rate-limited execution"""
        await self.rate_limiter.acquire()
        return await self._process(input_data)

📈 Performance Optimization
Caching
python

class CachedPlugin(BasePlugin):
    def __init__(self, cache):
        self.cache = cache
        
    async def execute(self, input_data: dict) -> dict:
        """Cached execution"""
        cache_key = self._generate_cache_key(input_data)
        
        if cached := await self.cache.get(cache_key):
            return cached
            
        result = await self._process(input_data)
        await self.cache.set(cache_key, result, ttl=300)
        return result

Async Operations
python

class AsyncPlugin(BasePlugin):
    async def execute(self, input_data: dict) -> dict:
        """Efficient async processing"""
        # Process multiple items concurrently
        tasks = [
            self._process_item(item)
            for item in input_data["items"]
        ]
        results = await asyncio.gather(*tasks)
        return {"results": results}

Resource Management
python

class ResourcePlugin(BasePlugin):
    def __init__(self):
        self.semaphore = asyncio.Semaphore(10)  # Max 10 concurrent
        
    async def execute(self, input_data: dict) -> dict:
        """Resource-limited execution"""
        async with self.semaphore:
            return await self._process(input_data)

🎯 Best Practices
Code Quality

    Type Hints: Use comprehensive type annotations

    Error Handling: Implement robust error handling

    Logging: Add appropriate logging and monitoring

    Testing: Maintain high test coverage

    Documentation: Provide clear usage examples

Performance

    Use async/await for I/O operations

    Implement caching for expensive operations

    Monitor resource usage and memory leaks

    Use connection pooling for external services

Security

    Validate all inputs and outputs

    Use secure secret management

    Implement rate limiting

    Regular security audits

Maintenance

    Version your plugins

    Provide upgrade paths

    Monitor dependency updates

    Regular performance testing

🔧 Example Plugins
Complete Weather Plugin
python

class WeatherPlugin(BasePlugin):
    name = "weather"
    description = "Get weather information"
    version = "1.0.0"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.weatherapi.com/v1"
        
    async def execute(self, location: str, days: int = 1) -> dict:
        """Get weather forecast"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/forecast.json",
                params={
                    "key": self.api_key,
                    "q": location,
                    "days": days
                }
            )
            response.raise_for_status()
            return response.json()

File Processor Plugin
python

class FileProcessorPlugin(BasePlugin):
    name = "file_processor"
    
    async def execute(self, operation: str, **kwargs) -> dict:
        """Process files with various operations"""
        operations = {
            "read": self._read_file,
            "write": self._write_file,
            "copy": self._copy_file,
            "delete": self._delete_file
        }
        
        if operation not in operations:
            raise ValueError(f"Unknown operation: {operation}")
            
        return await operations[operation](**kwargs)