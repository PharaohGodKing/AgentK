
plugins/plugin_manager.py

import importlib
import inspect
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Type
from plugins.base_plugin import BasePlugin

logger = logging.getLogger(__name__)

class PluginManager:
    def __init__(self):
        self.plugins: Dict[str, BasePlugin] = {}
        self.plugin_configs: Dict[str, Dict[str, Any]] = {}
        self.core_plugins_path = Path(__file__).parent / "core_plugins"
        self.custom_plugins_path = Path(__file__).parent / "custom_plugins"
        
    async def initialize(self):
        """Initialize the plugin manager"""
        logger.info("Initializing plugin manager")
        
        # Create custom plugins directory if it doesn't exist
        self.custom_plugins_path.mkdir(exist_ok=True)
        
        # Load core plugins
        await self.load_core_plugins()
        
        # Load custom plugins
        await self.load_custom_plugins()
        
        logger.info(f"Plugin manager initialized with {len(self.plugins)} plugins")
    
    async def load_core_plugins(self):
        """Load all core plugins"""
        logger.info("Loading core plugins")
        
        core_plugins = [
            "web_search",
            "file_processor", 
            "code_executor",
            "image_generator"
        ]
        
        for plugin_name in core_plugins:
            try:
                await self.load_plugin(plugin_name, is_core=True)
                logger.info(f"Loaded core plugin: {plugin_name}")
            except Exception as e:
                logger.error(f"Failed to load core plugin {plugin_name}: {e}")
    
    async def load_custom_plugins(self):
        """Load all custom plugins from the custom_plugins directory"""
        logger.info("Loading custom plugins")
        
        for plugin_file in self.custom_plugins_path.glob("*.py"):
            if plugin_file.name == "__init__.py" or plugin_file.name == "example_plugin.py":
                continue
                
            plugin_name = plugin_file.stem
            try:
                await self.load_plugin(plugin_name, is_core=False)
                logger.info(f"Loaded custom plugin: {plugin_name}")
            except Exception as e:
                logger.error(f"Failed to load custom plugin {plugin_name}: {e}")
    
    async def load_plugin(self, plugin_id: str, is_core: bool = True) -> bool:
        """
        Load a plugin by ID
        
        Args:
            plugin_id: The ID of the plugin to load
            is_core: Whether this is a core plugin or custom plugin
            
        Returns:
            bool: True if the plugin was loaded successfully
        """
        try:
            # Determine the module path
            if is_core:
                module_path = f"plugins.core_plugins.{plugin_id}"
            else:
                module_path = f"plugins.custom_plugins.{plugin_id}"
            
            # Import the module
            module = importlib.import_module(module_path)
            
            # Find the plugin class (should be the same name as the file in CamelCase)
            class_name = self._snake_to_camel(plugin_id)
            plugin_class = None
            
            for name, obj in inspect.getmembers(module):
                if (inspect.isclass(obj) and 
                    issubclass(obj, BasePlugin) and 
                    obj != BasePlugin and
                    name.lower() == class_name.lower()):
                    plugin_class = obj
                    break
            
            if not plugin_class:
                raise ValueError(f"Plugin class not found in {module_path}")
            
            # Create plugin instance with config
            config = self.plugin_configs.get(plugin_id, {})
            plugin_instance = plugin_class(config)
            
            # Initialize the plugin
            await plugin_instance.initialize()
            
            # Store the plugin
            self.plugins[plugin_id] = plugin_instance
            
            logger.info(f"Successfully loaded plugin: {plugin_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading plugin {plugin_id}: {e}")
            raise
    
    async def unload_plugin(self, plugin_id: str) -> bool:
        """
        Unload a plugin
        
        Args:
            plugin_id: The ID of the plugin to unload
            
        Returns:
            bool: True if the plugin was unloaded successfully
        """
        if plugin_id not in self.plugins:
            logger.warning(f"Plugin {plugin_id} not found")
            return False
        
        try:
            plugin = self.plugins[plugin_id]
            await plugin.cleanup()
            del self.plugins[plugin_id]
            
            logger.info(f"Successfully unloaded plugin: {plugin_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error unloading plugin {plugin_id}: {e}")
            return False
    
    async def execute_plugin(self, plugin_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a plugin with the given parameters
        
        Args:
            plugin_id: The ID of the plugin to execute
            parameters: Parameters to pass to the plugin
            
        Returns:
            Dict with the execution results
        """
        if plugin_id not in self.plugins:
            raise ValueError(f"Plugin {plugin_id} not found")
        
        try:
            plugin = self.plugins[plugin_id]
            result = await plugin.execute(parameters)
            
            logger.info(f"Executed plugin {plugin_id} successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error executing plugin {plugin_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "plugin_id": plugin_id
            }
    
    def get_plugin(self, plugin_id: str) -> Optional[BasePlugin]:
        """Get a plugin instance by ID"""
        return self.plugins.get(plugin_id)
    
    def get_all_plugins(self) -> Dict[str, BasePlugin]:
        """Get all loaded plugins"""
        return self.plugins.copy()
    
    def get_plugins_by_capability(self, capability: str) -> List[BasePlugin]:
        """Get all plugins that have a specific capability"""
        return [
            plugin for plugin in self.plugins.values() 
            if capability in plugin.capabilities
        ]
    
    def set_plugin_config(self, plugin_id: str, config: Dict[str, Any]):
        """Set configuration for a plugin"""
        self.plugin_configs[plugin_id] = config
    
    async def reload_plugin(self, plugin_id: str) -> bool:
        """Reload a plugin"""
        await self.unload_plugin(plugin_id)
        return await self.load_plugin(plugin_id, is_core=plugin_id in self.get_core_plugin_ids())
    
    def get_core_plugin_ids(self) -> List[str]:
        """Get list of core plugin IDs"""
        return ["web_search", "file_processor", "code_executor", "image_generator"]
    
    def _snake_to_camel(self, snake_str: str) -> str:
        """Convert snake_case to CamelCase"""
        components = snake_str.split('_')
        return ''.join(x.title() for x in components)
    
    async def cleanup(self):
        """Clean up all plugins"""
        logger.info("Cleaning up all plugins")
        
        for plugin_id in list(self.plugins.keys()):
            await self.unload_plugin(plugin_id)
        
        logger.info("All plugins cleaned up")

# Global plugin manager instance
_plugin_manager = None

async def get_plugin_manager() -> PluginManager:
    """Get the global plugin manager instance"""
    global _plugin_manager
    if _plugin_manager is None:
        _plugin_manager = PluginManager()
        await _plugin_manager.initialize()
    return _plugin_manager