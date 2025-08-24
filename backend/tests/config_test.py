import pytest
from backend.core.config import Settings

def test_settings_defaults():
    """Test that settings have correct defaults"""
    settings = Settings()
    
    assert settings.APP_NAME == "AgentK"
    assert settings.APP_ENV == "development"
    assert settings.DEBUG == True
    assert settings.HOST == "0.0.0.0"
    assert settings.PORT == 8000

def test_settings_from_env(monkeypatch):
    """Test that settings can be loaded from environment variables"""
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DEBUG", "false")
    monkeypatch.setenv("PORT", "9000")
    
    settings = Settings()
    
    assert settings.APP_ENV == "production"
    assert settings.DEBUG == False
    assert settings.PORT == 9000