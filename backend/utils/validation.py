import re
import json
from typing import Any, Dict
from email_validator import validate_email as validate_email_format, EmailNotValidError

def validate_email(email: str) -> bool:
    """Validate an email address"""
    try:
        validate_email_format(email)
        return True
    except EmailNotValidError:
        return False

def validate_url(url: str) -> bool:
    """Validate a URL"""
    url_regex = re.compile(
        r'^(?:http|ftp)s?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return re.match(url_regex, url) is not None

def validate_json(json_str: str) -> bool:
    """Validate JSON string"""
    try:
        json.loads(json_str)
        return True
    except json.JSONDecodeError:
        return False

def validate_agent_config(config: Dict[str, Any]) -> bool:
    """Validate agent configuration"""
    # Basic validation - can be expanded based on requirements
    required_fields = ["model", "temperature", "max_tokens"]
    for field in required_fields:
        if field not in config:
            return False
    
    # Validate specific values
    if not 0 <= config.get("temperature", 1.0) <= 2.0:
        return False
    
    if config.get("max_tokens", 0) < -1:  # -1 means no limit
        return False
    
    return True