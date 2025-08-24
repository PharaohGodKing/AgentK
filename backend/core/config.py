from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://127.0.0.1:5500"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create a single settings instance to be used throughout the application
settings = Settings()