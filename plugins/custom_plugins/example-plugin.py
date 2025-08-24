"""
Example custom plugin for AgentK - Demonstrates how to create custom plugins
"""

from typing import Dict, Any
from plugins.base_plugin import BasePlugin
import logging
import random

logger = logging.getLogger(__name__)

class ExamplePlugin(BasePlugin):
    """
    Example custom plugin that demonstrates plugin development
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.name = "Example Plugin"
        self.version = "1.0.0"
        self.description = "An example custom plugin for AgentK that demonstrates various capabilities"
        self.capabilities = ["example_operation", "data_processing", "utility"]
        
        # Configuration with defaults
        self.default_greeting = self.get_config_value("default_greeting", "Hello")
        self.max_items = self.get_config_value("max_items", 10)
        
        # Plugin state
        self.usage_count = 0
    
    async def initialize(self) -> None:
        """Initialize the example plugin"""
        await super().initialize()
        logger.info(f"Example Plugin initialized with greeting: {self.default_greeting}")
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the example plugin
        
        Args:
            parameters: Can contain 'name', 'operation', and other parameters
            
        Returns:
            Dictionary with execution results
        """
        self.usage_count += 1
        
        operation = parameters.get("operation", "greet")
        
        try:
            if operation == "greet":
                return await self._greet_operation(parameters)
            elif operation == "process":
                return await self._process_operation(parameters)
            elif operation == "random":
                return await self._random_operation(parameters)
            else:
                return {
                    "success": False,
                    "error": f"Unknown operation: {operation}",
                    "available_operations": ["greet", "process", "random"]
                }
                
        except Exception as e:
            logger.error(f"Example plugin operation failed: {e}")
            return {
                "success": False,
                "error": f"Operation failed: {str(e)}",
                "operation": operation
            }
    
    async def _greet_operation(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Example greeting operation"""
        name = parameters.get("name", "World")
        greeting = parameters.get("greeting", self.default_greeting)
        
        message = f"{greeting}, {name}!"
        
        return {
            "success": True,
            "operation": "greet",
            "message": message,
            "usage_count": self.usage_count
        }
    
    async def _process_operation(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Example data processing operation"""
        if not self.validate_parameters(parameters, ["data"]):
            return {
                "success": False,
                "error": "Missing required parameter: data"
            }
        
        data = parameters["data"]
        operation = parameters.get("process_type", "reverse")
        
        try:
            if operation == "reverse":
                if isinstance(data, str):
                    processed = data[::-1]
                elif isinstance(data, list):
                    processed = list(reversed(data))
                else:
                    processed = str(data)[::-1]
                    
            elif operation == "uppercase":
                processed = str(data).upper()
                
            elif operation == "lowercase":
                processed = str(data).lower()
                
            elif operation == "shuffle":
                if isinstance(data, list):
                    processed = data.copy()
                    random.shuffle(processed)
                else:
                    processed = list(str(data))
                    random.shuffle(processed)
                    processed = ''.join(processed)
                    
            else:
                return {
                    "success": False,
                    "error": f"Unknown process type: {operation}",
                    "available_types": ["reverse", "uppercase", "lowercase", "shuffle"]
                }
            
            return {
                "success": True,
                "operation": "process",
                "process_type": operation,
                "original_data": data,
                "processed_data": processed,
                "data_type": type(data).__name__
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Data processing failed: {str(e)}",
                "operation": "process",
                "process_type": operation
            }
    
    async def _random_operation(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Example random data generation operation"""
        data_type = parameters.get("type", "number")
        count = min(parameters.get("count", 1), self.max_items)
        
        try:
            if data_type == "number":
                min_val = parameters.get("min", 0)
                max_val = parameters.get("max", 100)
                result = [random.randint(min_val, max_val) for _ in range(count)]
                
            elif data_type == "string":
                length = parameters.get("length", 8)
                result = [''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=length)) 
                         for _ in range(count)]
                
            elif data_type == "choice":
                if not self.validate_parameters(parameters, ["choices"]):
                    return {
                        "success": False,
                        "error": "Missing required parameter: choices for choice type"
                    }
                choices = parameters["choices"]
                result = [random.choice(choices) for _ in range(count)]
                
            else:
                return {
                    "success": False,
                    "error": f"Unknown data type: {data_type}",
                    "available_types": ["number", "string", "choice"]
                }
            
            # If only one item requested, return it directly instead of a list
            if count == 1:
                result = result[0]
            
            return {
                "success": True,
                "operation": "random",
                "data_type": data_type,
                "result": result,
                "count": count if isinstance(result, list) else 1
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Random generation failed: {str(e)}",
                "operation": "random",
                "data_type": data_type
            }
    
    async def cleanup(self) -> None:
        """Clean up resources"""
        await super().cleanup()
        logger.info(f"Example Plugin cleaned up. Total usage: {self.usage_count}")