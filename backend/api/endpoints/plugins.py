from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from backend.services.plugin_service import PluginService

router = APIRouter()

@router.get("/")
async def get_plugins(service: PluginService = Depends(PluginService)):
    """Get all available plugins"""
    try:
        plugins = await service.get_all_plugins()
        return {"plugins": plugins}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching plugins: {str(e)}"
        )

@router.get("/{plugin_id}")
async def get_plugin(plugin_id: str, service: PluginService = Depends(PluginService)):
    """Get a specific plugin"""
    try:
        plugin = await service.get_plugin(plugin_id)
        if not plugin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plugin with ID {plugin_id} not found"
            )
        return plugin
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching plugin: {str(e)}"
        )

@router.post("/{plugin_id}/install")
async def install_plugin(plugin_id: str, service: PluginService = Depends(PluginService)):
    """Install a plugin"""
    try:
        success = await service.install_plugin(plugin_id)
        return {"success": success, "message": "Plugin installed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error installing plugin: {str(e)}"
        )

@router.post("/{plugin_id}/uninstall")
async def uninstall_plugin(plugin_id: str, service: PluginService = Depends(PluginService)):
    """Uninstall a plugin"""
    try:
        success = await service.uninstall_plugin(plugin_id)
        return {"success": success, "message": "Plugin uninstalled successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uninstalling plugin: {str(e)}"
        )

@router.post("/{plugin_id}/activate")
async def activate_plugin(plugin_id: str, service: PluginService = Depends(PluginService)):
    """Activate a plugin"""
    try:
        success = await service.activate_plugin(plugin_id)
        return {"success": success, "message": "Plugin activated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error activating plugin: {str(e)}"
        )

@router.post("/{plugin_id}/deactivate")
async def deactivate_plugin(plugin_id: str, service: PluginService = Depends(PluginService)):
    """Deactivate a plugin"""
    try:
        success = await service.deactivate_plugin(plugin_id)
        return {"success": success, "message": "Plugin deactivated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deactivating plugin: {str(e)}"
        )

@router.post("/{plugin_id}/execute")
async def execute_plugin(plugin_id: str, parameters: Dict[str, Any], service: PluginService = Depends(PluginService)):
    """Execute a plugin with parameters"""
    try:
        result = await service.execute_plugin(plugin_id, parameters)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing plugin: {str(e)}"
        )