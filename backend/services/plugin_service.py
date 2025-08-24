from typing import List, Optional, Dict, Any
import importlib
import inspect
from pathlib import Path
from backend.models.plugin import Plugin, PluginCreate, PluginStatus
from backend.db.database import get_db
from backend.db.crud import create_plugin, get_plugin, get_all_plugins, update_plugin, delete_plugin
import uuid

class PluginService:
    def __init__(self):
        self.db = get_db()
        self.loaded_plugins = {}
    
    async def get_all_plugins(self) -> List[Plugin]:
        """Get all plugins"""
        return await get_all_plugins(self.db)
    
    async def get_plugin(self, plugin_id: str) -> Optional[Plugin]:
        """Get a specific plugin"""
        return await get_plugin(self.db, plugin_id)
    
    async def install_plugin(self, plugin_id: str) -> bool:
        """Install a plugin"""
        # This would typically involve:
        # 1. Loading plugin code from file system
        # 2. Validating plugin structure
        # 3. Adding to database
        # 4. Initializing plugin
        
        try:
            # For now, we'll create a mock plugin
            plugin_data = PluginCreate(
                name=f"Plugin {plugin_id}",
                description="A sample plugin",
                version="1.0.0",
                author="System",
                capabilities=["sample_capability"],
                config_schema={"setting": {"type": "string", "default": "value"}}
            )
            
            plugin = Plugin(
                id=plugin_id,
                **plugin_data.dict(),
                status=PluginStatus.INSTALLED,
                config={"setting": "value"}
            )
            
            await create_plugin(self.db, plugin)
            return True
        except Exception as e:
            print(f"Error installing plugin: {str(e)}")
            return False
    
    async def uninstall_plugin(self, plugin_id: str) -> bool:
        """Uninstall a plugin"""
        try:
            # Remove from loaded plugins if active
            if plugin_id in self.loaded_plugins:
                del self.loaded_plugins[plugin_id]
            
            # Remove from database
            return await delete_plugin(self.db, plugin_id)
        except Exception as e:
            print(f"Error uninstalling plugin: {str(e)}")
            return False
    
    async def activate_plugin(self, plugin_id: str) -> bool:
        """Activate a plugin"""
        try:
            plugin = await self.get_plugin(plugin_id)
            if not plugin:
                return False
            
            # Load plugin module
            plugin_path = f"plugins.custom_plugins.{plugin_id}"
            try:
                plugin_module = importlib.import_module(plugin_path)
                
                # Find plugin class (assuming class name is Plugin)
                plugin_class = None
                for name, obj in inspect.getmembers(plugin_module):
                    if inspect.isclass(obj) and name == "Plugin":
                        plugin_class = obj
                        break
                
                if plugin_class:
                    plugin_instance = plugin_class(plugin.config)
                    self.loaded_plugins[plugin_id] = plugin_instance
                    
                    # Update plugin status
                    await update_plugin(self.db, plugin_id, {"status": PluginStatus.ACTIVATED})
                    return True
                else:
                    print(f"Plugin class not found in {plugin_path}")
                    return False
                    
            except ImportError as e:
                print(f"Error loading plugin module: {str(e)}")
                return False
                
        except Exception as e:
            print(f"Error activating plugin: {str(e)}")
            return False
    
    async def deactivate_plugin(self, plugin_id: str) -> bool:
        """Deactivate a plugin"""
        try:
            # Remove from loaded plugins
            if plugin_id in self.loaded_plugins:
                del self.loaded_plugins[plugin_id]
            
            # Update plugin status
            await update_plugin(self.db, plugin_id, {"status": PluginStatus.DEACTIVATED})
            return True
        except Exception as e:
            print(f"Error deactivating plugin: {str(e)}")
            return False
    
    async def execute_plugin(self, plugin_id: str, parameters: Dict[str, Any]) -> Any:
        """Execute a plugin with parameters"""
        if plugin_id not in self.loaded_plugins:
            # Try to activate plugin first
            if not await self.activate_plugin(plugin_id):
                raise ValueError(f"Plugin {plugin_id} is not active and could not be activated")
        
        plugin_instance = self.loaded_plugins[plugin_id]
        
        try:
            # Execute plugin
            result = await plugin_instance.execute(parameters)
            return result
        except Exception as e:
            print(f"Error executing plugin: {str(e)}")
            raise
    
    async def discover_plugins(self) -> List[Dict[str, Any]]:
        """Discover available plugins in the plugins directory"""
        plugins_dir = Path("plugins/custom_plugins")
        discovered_plugins = []
        
        if plugins_dir.exists():
            for plugin_file in plugins_dir.glob("*.py"):
                if plugin_file.name != "__init__.py":
                    plugin_id = plugin_file.stem
                    discovered_plugins.append({
                        "id": plugin_id,
                        "name": plugin_id.replace("_", " ").title(),
                        "description": f"Plugin from {plugin_file.name}",
                        "file_path": str(plugin_file)
                    })
        
        return discovered_plugins