"""
AI Assistant chatbot endpoints.
Simple Gemini-powered assistant for coordinators.
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from app.gemini import chat_with_gemini


router = APIRouter(prefix="/chatbot", tags=["AI Assistant"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    message: str


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message to the AI assistant"
)
async def chat(request: ChatRequest):
    """
    Chat with the AI assistant.
    
    - Sends user message to Gemini
    - Optionally includes conversation history (last 6 messages)
    - Returns AI response
    """
    try:
        # Convert Pydantic models to dicts for gemini function
        history_dicts = None
        if request.history:
            history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        # Get response from Gemini
        ai_response = chat_with_gemini(request.message, history_dicts)
        
        return ChatResponse(
            response=ai_response,
            message="Success"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI response: {str(e)}"
        )


@router.get(
    "/health",
    summary="Check if chatbot service is available"
)
async def chatbot_health():
    """
    Health check for chatbot service.
    """
    try:
        from app.config import get_settings
        settings = get_settings()
        
        if not settings.gemini_api_key:
            return {
                "status": "unavailable",
                "message": "Gemini API key not configured"
            }
        
        return {
            "status": "available",
            "message": "Chatbot service is ready"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
