"""
Simple Google Gemini API integration for chatbot.
Ultra-minimal implementation for coordinator AI assistant.
"""
import google.generativeai as genai
from app.config import get_settings
import os


def get_system_prompt() -> str:
    """Load system prompt from text file."""
    prompt_path = os.path.join(os.path.dirname(__file__), "system_prompt.txt")
    with open(prompt_path, 'r') as f:
        return f.read().strip()


def configure_gemini():
    """Configure Gemini API with API key."""
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)


def chat_with_gemini(user_message: str, chat_history: list = None) -> str:
    """
    Send a message to Gemini and get a response.
    
    Args:
        user_message: User's input message
        chat_history: Optional list of previous messages [{"role": "user", "content": "..."}, ...]
    
    Returns:
        AI response as string
    """
    configure_gemini()
    
    # Initialize model (gemini-2.5-flash-lite is the smallest/cheapest free tier)
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    
    # Build conversation history
    system_prompt = get_system_prompt()
    
    # If there's chat history, build the full conversation
    if chat_history:
        # Start with system prompt as first user message
        full_conversation = f"{system_prompt}\n\n"
        
        # Add history (only last 4 messages to minimize tokens)
        for msg in chat_history[-4:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            full_conversation += f"{role}: {msg['content']}\n"
        
        # Add current message
        full_conversation += f"User: {user_message}\nAssistant:"
        
        response = model.generate_content(full_conversation)
    else:
        # First message - include system prompt
        full_message = f"{system_prompt}\n\nUser: {user_message}\nAssistant:"
        response = model.generate_content(full_message)
    
    return response.text
