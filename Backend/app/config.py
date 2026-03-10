"""
Configuration module for loading environment variables and app settings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase
    supabase_url: str
    supabase_key: str
    
    # HuggingFace API (for embeddings)
    huggingface_api_key: str = ""  # Optional, works without auth but with rate limits
    
    # AWS S3 (for document storage)
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    aws_s3_bucket: str = ""
    
    # Application
    environment: str = "development"
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = 384
    
    # Matching defaults
    match_threshold: float = 0.5
    default_match_count: int = 10
    
    # Activity scoring
    points_signup: int = 10
    points_task_completion: int = 50
    points_check_in: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance. This ensures we only load environment 
    variables once, and reuse the same settings throughout the app.
    """
    return Settings()
