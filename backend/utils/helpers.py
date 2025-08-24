import uuid
import random
import string
from datetime import datetime, timedelta
from typing import Any, Dict, List

def generate_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix"""
    id_str = str(uuid.uuid4())
    if prefix:
        return f"{prefix}_{id_str}"
    return id_str

def format_timestamp(timestamp: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format a datetime object as string"""
    return timestamp.strftime(format_str)

def parse_timestamp(timestamp_str: str, format_str: str = "%Y-%m-%d %H:%M:%S") -> datetime:
    """Parse a string into a datetime object"""
    return datetime.strptime(timestamp_str, format_str)

def truncate_text(text: str, max_length: int = 100, ellipsis: str = "...") -> str:
    """Truncate text to maximum length with ellipsis"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(ellipsis)] + ellipsis

def generate_random_string(length: int = 8) -> str:
    """Generate a random string of specified length"""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def deep_merge_dicts(dict1: Dict[Any, Any], dict2: Dict[Any, Any]) -> Dict[Any, Any]:
    """Deep merge two dictionaries"""
    result = dict1.copy()
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value
    return result

def filter_dict(data: Dict[Any, Any], keys: List[Any]) -> Dict[Any, Any]:
    """Filter dictionary to include only specified keys"""
    return {key: data[key] for key in keys if key in data}

def get_nested_value(data: Dict[Any, Any], path: str, default: Any = None) -> Any:
    """Get nested value from dictionary using dot notation path"""
    keys = path.split('.')
    value = data
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return default
    return value

def set_nested_value(data: Dict[Any, Any], path: str, value: Any) -> None:
    """Set nested value in dictionary using dot notation path"""
    keys = path.split('.')
    current = data
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        current = current[key]
    current[keys[-1]] = value