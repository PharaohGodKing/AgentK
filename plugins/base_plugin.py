"""
Base plugin class for AgentK plugins
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class BasePlugin(ABC):
    """
    Abstract base class for all AgentK plugins
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the plugin with configuration
        
        Args:
            config: Plugin configuration dictionary
        """
        self.config = config or {}
        self.name = "Unnamed Plugin"
        self.version = "1.0.0"
        self.description = "A plugin for AgentK"
        self.capabilities: List[str] = []
        self.initialized = False
        
        logger.debug(f"Initialized plugin: {self.name} v{self.version}")
    
    async def initialize(self) -> None:
        """
        Initialize the plugin. This should be overridden by subclasses
        to perform any necessary setup.
        """
        self.initialized = True
        logger.info(f"Plugin initialized: {self.name}")
    
    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the plugin with the given parameters.
        This must be implemented by subclasses.
        
        Args:
            parameters: Dictionary of parameters for the plugin execution
            
        Returns:
            Dictionary containing the execution results
        """
        pass
    
    async def cleanup(self) -> None:
        """
        Clean up any resources used by the plugin.
        This should be overridden by subclasses if cleanup is needed.
        """
        self.initialized = False
        logger.info(f"Plugin cleaned up: {self.name}")
    
    def validate_parameters(self, parameters: Dict[str, Any], required_params: List[str]) -> bool:
        """
        Validate that all required parameters are present
        
        Args:
            parameters: Parameters to validate
            required_params: List of required parameter names
            
        Returns:
            bool: True if all required parameters are present
        """
        missing_params = [param for param in required_params if param not in parameters]
        
        if missing_params:
            logger.warning(f"Missing required parameters: {missing_params}")
            return False
        
        return True
    
    def get_config_value(self, key: str, default: Any = None) -> Any:
        """
        Get a value from the plugin configuration
        
        Args:
            key: Configuration key
            default: Default value if key not found
            
        Returns:
            The configuration value or default
        """
        return self.config.get(key, default)
    
    def __str__(self) -> str:
        return f"{self.name} v{self.version} - {self.description}"
    
    def __repr__(self) -> str:
        return f"<Plugin {self.name} v{self.version}>"