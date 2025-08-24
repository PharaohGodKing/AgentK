from typing import Dict, Any, List
import psutil
import time
from datetime import datetime, timedelta
from backend.core.config import settings

class MetricsService:
    def __init__(self):
        self.metrics_history = []
        self.request_count = 0
        self.start_time = time.time()
    
    async def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect system metrics"""
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_total_gb = round(memory.total / (1024 ** 3), 2)
        memory_used_gb = round(memory.used / (1024 ** 3), 2)
        memory_percent = memory.percent
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_total_gb = round(disk.total / (1024 ** 3), 2)
        disk_used_gb = round(disk.used / (1024 ** 3), 2)
        disk_percent = disk.percent
        
        # Network I/O
        net_io = psutil.net_io_counters()
        
        metrics = {
            "timestamp": datetime.now().isoformat(),
            "cpu": {
                "percent": cpu_percent,
                "percent_per_core": psutil.cpu_percent(percpu=True),
            },
            "memory": {
                "total_gb": memory_total_gb,
                "used_gb": memory_used_gb,
                "percent": memory_percent,
            },
            "disk": {
                "total_gb": disk_total_gb,
                "used_gb": disk_used_gb,
                "percent": disk_percent,
            },
            "network": {
                "bytes_sent": net_io.bytes_sent,
                "bytes_recv": net_io.bytes_recv,
            },
            "system": {
                "uptime": round(time.time() - self.start_time),
                "request_count": self.request_count,
            }
        }
        
        # Store in history (keep last 1000 metrics)
        self.metrics_history.append(metrics)
        if len(self.metrics_history) > 1000:
            self.metrics_history = self.metrics_history[-1000:]
        
        return metrics
    
    async def increment_request_count(self):
        """Increment the request counter"""
        self.request_count += 1
    
    async def get_metrics_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get metrics history"""
        return self.metrics_history[-limit:]
    
    async def get_metrics_summary(self, time_window: str = "1h") -> Dict[str, Any]:
        """Get metrics summary for a time window"""
        now = datetime.now()
        
        if time_window == "1h":
            window_start = now - timedelta(hours=1)
        elif time_window == "6h":
            window_start = now - timedelta(hours=6)
        elif time_window == "24h":
            window_start = now - timedelta(hours=24)
        else:
            window_start = now - timedelta(hours=1)
        
        # Filter metrics within the time window
        window_metrics = [
            m for m in self.metrics_history 
            if datetime.fromisoformat(m["timestamp"]) >= window_start
        ]
        
        if not window_metrics:
            return {}
        
        # Calculate averages
        cpu_values = [m["cpu"]["percent"] for m in window_metrics]
        memory_values = [m["memory"]["percent"] for m in window_metrics]
        disk_values = [m["disk"]["percent"] for m in window_metrics]
        
        return {
            "time_window": time_window,
            "metrics_count": len(window_metrics),
            "avg_cpu": round(sum(cpu_values) / len(cpu_values), 2),
            "avg_memory": round(sum(memory_values) / len(memory_values), 2),
            "avg_disk": round(sum(disk_values) / len(disk_values), 2),
            "min_cpu": round(min(cpu_values), 2),
            "max_cpu": round(max(cpu_values), 2),
            "requests_per_minute": round(self.request_count / (max(1, (now - window_start).total_seconds() / 60)), 2)
        }