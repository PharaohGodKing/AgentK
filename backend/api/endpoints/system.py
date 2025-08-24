from fastapi import APIRouter, Depends
import psutil
import platform
from datetime import datetime
from backend.core.config import settings

router = APIRouter()

@router.get("/status")
async def get_system_status():
    """Get system status and health information"""
    # Get CPU usage
    cpu_percent = psutil.cpu_percent(interval=1)
    
    # Get memory usage
    memory = psutil.virtual_memory()
    memory_total_gb = round(memory.total / (1024 ** 3), 2)
    memory_used_gb = round(memory.used / (1024 ** 3), 2)
    memory_percent = memory.percent
    
    # Get disk usage
    disk = psutil.disk_usage('/')
    disk_total_gb = round(disk.total / (1024 ** 3), 2)
    disk_used_gb = round(disk.used / (1024 ** 3), 2)
    disk_percent = disk.percent
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": settings.APP_ENV,
        "system": {
            "platform": platform.system(),
            "platform_version": platform.version(),
            "python_version": platform.python_version(),
        },
        "resources": {
            "cpu_percent": cpu_percent,
            "memory_total_gb": memory_total_gb,
            "memory_used_gb": memory_used_gb,
            "memory_percent": memory_percent,
            "disk_total_gb": disk_total_gb,
            "disk_used_gb": disk_used_gb,
            "disk_percent": disk_percent,
        },
        "services": {
            "database": "connected",  # This would be checked in a real implementation
            "llm_connection": "active",  # This would be checked in a real implementation
            "memory_store": "active",  # This would be checked in a real implementation
        }
    }

@router.get("/metrics")
async def get_system_metrics():
    """Get detailed system metrics"""
    # CPU metrics
    cpu_times = psutil.cpu_times()
    cpu_percent_per_core = psutil.cpu_percent(percpu=True)
    
    # Memory metrics
    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    
    # Disk metrics
    disk_io = psutil.disk_io_counters()
    disk_usage = psutil.disk_usage('/')
    
    # Network metrics
    net_io = psutil.net_io_counters()
    
    return {
        "cpu": {
            "percent": psutil.cpu_percent(interval=1),
            "percent_per_core": cpu_percent_per_core,
            "times": {
                "user": cpu_times.user,
                "system": cpu_times.system,
                "idle": cpu_times.idle,
            }
        },
        "memory": {
            "total": memory.total,
            "available": memory.available,
            "used": memory.used,
            "percent": memory.percent,
            "swap_total": swap.total,
            "swap_used": swap.used,
            "swap_percent": swap.percent,
        },
        "disk": {
            "total": disk_usage.total,
            "used": disk_usage.used,
            "free": disk_usage.free,
            "percent": disk_usage.percent,
            "read_bytes": disk_io.read_bytes if disk_io else 0,
            "write_bytes": disk_io.write_bytes if disk_io else 0,
        },
        "network": {
            "bytes_sent": net_io.bytes_sent,
            "bytes_recv": net_io.bytes_recv,
            "packets_sent": net_io.packets_sent,
            "packets_recv": net_io.packets_recv,
        }
    }

@router.get("/logs")
async def get_system_logs(limit: int = 100):
    """Get system logs (placeholder - would read from log files)"""
    # In a real implementation, this would read from log files
    return {
        "logs": [
            {"timestamp": datetime.now().isoformat(), "level": "INFO", "message": "System started"},
            {"timestamp": datetime.now().isoformat(), "level": "INFO", "message": "Database connected"},
        ][:limit]
    }