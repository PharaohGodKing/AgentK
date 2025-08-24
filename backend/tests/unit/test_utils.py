import pytest
from datetime import datetime
from backend.utils.helpers import generate_id, format_timestamp, truncate_text, deep_merge_dicts
from backend.utils.validation import validate_email, validate_url, validate_json

def test_generate_id():
    """Test generating unique IDs"""
    id1 = generate_id()
    id2 = generate_id()
    id3 = generate_id("test")
    
    assert len(id1) == 36  # UUID length
    assert len(id2) == 36
    assert id1 != id2
    assert id3.startswith("test_")

def test_format_timestamp():
    """Test formatting timestamps"""
    dt = datetime(2023, 1, 1, 12, 30, 45)
    formatted = format_timestamp(dt)
    
    assert formatted == "2023-01-01 12:30:45"
    
    custom_format = format_timestamp(dt, "%Y/%m/%d")
    assert custom_format == "2023/01/01"

def test_truncate_text():
    """Test truncating text"""
    text = "This is a long text that needs to be truncated"
    truncated = truncate_text(text, 20)
    
    assert len(truncated) == 20
    assert truncated.endswith("...")
    assert truncated == "This is a long te..."

def test_deep_merge_dicts():
    """Test deep merging dictionaries"""
    dict1 = {"a": 1, "b": {"c": 2, "d": 3}}
    dict2 = {"b": {"d": 4, "e": 5}, "f": 6}
    
    merged = deep_merge_dicts(dict1, dict2)
    
    assert merged["a"] == 1
    assert merged["b"]["c"] == 2
    assert merged["b"]["d"] == 4
    assert merged["b"]["e"] == 5
    assert merged["f"] == 6

def test_validate_email():
    """Test email validation"""
    assert validate_email("test@example.com") == True
    assert validate_email("invalid-email") == False
    assert validate_email("another@test.co.uk") == True

def test_validate_url():
    """Test URL validation"""
    assert validate_url("https://example.com") == True
    assert validate_url("http://localhost:8000") == True
    assert validate_url("invalid-url") == False
    assert validate_url("ftp://files.example.com") == True

def test_validate_json():
    """Test JSON validation"""
    assert validate_json('{"key": "value"}') == True
    assert validate_json('{"key": "value", "number": 123}') == True
    assert validate_json('invalid-json') == False
    assert validate_json('{"key": "value"') == False