# AgentK Plugin System

The AgentK plugin system allows you to extend the functionality of your AI agents with custom capabilities.

## Plugin Structure

A plugin is a Python class that extends the `BasePlugin` class and implements the required methods.

### Basic Plugin Example

```python
from plugins.base_plugin import BasePlugin

class ExamplePlugin(BasePlugin):
    def __init__(self, config=None):
        super().__init__(config)
        self.name = "Example Plugin"
        self.version = "1.0.0"
        self.description = "An example plugin for AgentK"
        self.capabilities = ["example_capability"]
    
    async def execute(self, parameters):
        """Execute the plugin with the given parameters"""
        # Your plugin logic here
        result = f"Example plugin executed with: {parameters}"
        return {"success": True, "result": result}