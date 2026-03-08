"""
Database module for Supabase client initialization and operations.
"""
from supabase import create_client, Client
from functools import lru_cache
from app.config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    Initialize and return a cached Supabase client.
    This singleton pattern ensures we reuse the same client connection.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)


def get_db() -> Client:
    """
    Dependency injection function for FastAPI routes.
    """
    return get_supabase_client()
