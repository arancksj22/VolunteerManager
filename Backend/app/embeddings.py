"""
Embedding engine using HuggingFace Inference API for semantic matching.
Simple, lightweight, and free for development!
"""
from typing import List
from huggingface_hub import InferenceClient
from app.config import get_settings


class EmbeddingEngine:
    """
    HuggingFace API-based embedding engine using official InferenceClient.
    No local model needed - calls HuggingFace's free inference API.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingEngine, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize API configuration."""
        settings = get_settings()
        self.model_name = settings.model_name
        self.client = InferenceClient(
            model=self.model_name,
            token=settings.huggingface_api_key or None,
        )
        print(f"✅ Embedding engine configured with HuggingFace API: {self.model_name}")
    
    def encode(self, text: str, retries: int = 3) -> List[float]:
        """
        Generate embedding vector for the given text using HuggingFace API.
        
        Args:
            text: Input text to encode
            retries: Number of retries if model is loading
            
        Returns:
            List of floats representing the 384-dimensional embedding
        """
        if not text or not text.strip():
            settings = get_settings()
            return [0.0] * settings.embedding_dimension
        
        for attempt in range(retries):
            try:
                result = self.client.feature_extraction(text)
                # Result can be nested; flatten to 1D list
                if hasattr(result, 'tolist'):
                    result = result.tolist()
                if isinstance(result, list) and len(result) > 0:
                    if isinstance(result[0], list):
                        return result[0]
                    return result
                return result
                
            except Exception as e:
                if attempt < retries - 1:
                    import time
                    time.sleep(2 ** attempt)
                    continue
                raise Exception(f"Failed to generate embedding: {str(e)}")
        
        raise Exception("Failed to generate embedding after all retries")
    
    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        Note: For simplicity, this calls encode() for each text.
        HuggingFace API can handle batches, but individual calls are fine for small batches.
        
        Args:
            texts: List of input texts to encode
            
        Returns:
            List of embedding vectors
        """
        if not texts:
            return []
        
        return [self.encode(text) for text in texts]


# Global singleton instance
_embedding_engine = None


def get_embedding_engine() -> EmbeddingEngine:
    """
    Get or create the global embedding engine instance.
    This is the recommended way to access the embedding engine.
    """
    global _embedding_engine
    if _embedding_engine is None:
        _embedding_engine = EmbeddingEngine()
    return _embedding_engine


# Convenience function for quick encoding
def encode_text(text: str) -> List[float]:
    """Quick function to encode text using the global embedding engine."""
    engine = get_embedding_engine()
    return engine.encode(text)
