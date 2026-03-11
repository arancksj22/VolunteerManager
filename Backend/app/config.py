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
    
    # Google Gemini API (for chatbot)
    gemini_api_key: str = ""
    
    # AWS S3 (for document storage)
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_region: str = "us-east-1"
    aws_s3_bucket: str = ""
    aws_endpoint_url: str = ""  # For Backblaze B2 or other S3-compatible services
    
    # Redis (for coordinator notes)
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    
    # Resend (for email notifications)
    resend_api_key: str = ""
    
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
    daily_decay_points: int = 2
    
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
