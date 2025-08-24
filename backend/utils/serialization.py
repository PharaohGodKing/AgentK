import json
from datetime import datetime, date
from decimal import Decimal
from typing import Any
from pydantic import BaseModel

def json_serializer(obj: Any) -> Any:
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, BaseModel):
        return obj.dict()
    if hasattr(obj, '__dict__'):
        return obj.__dict__
    raise TypeError(f"Type {type(obj)} not serializable")

def datetime_serializer(obj: Any) -> Any:
    """Serialize datetime objects to ISO format"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj

def model_serializer(obj: Any) -> Any:
    """Serialize Pydantic models"""
    if isinstance(obj, BaseModel):
        return obj.dict()
    return obj