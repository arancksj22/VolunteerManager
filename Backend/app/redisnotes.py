"""
Redis-based notes storage for coordinators.
Simple notes system to demonstrate Redis usage.
"""
import redis
import json
from typing import List, Optional
from datetime import datetime
from .config import get_settings

settings = get_settings()


def get_redis_client():
    """Get Redis client connection."""
    try:
        r = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password if settings.redis_password else None,
            decode_responses=True,
            socket_connect_timeout=5
        )
        r.ping()
        return r
    except Exception as e:
        print(f"Redis connection error: {e}")
        raise


def create_note(coordinator_email: str, content: str, tags: List[str] = None) -> dict:
    """Create a new note for a coordinator."""
    r = get_redis_client()
    
    note_id = f"note:{coordinator_email}:{datetime.utcnow().timestamp()}"
    note = {
        "id": note_id,
        "coordinator_email": coordinator_email,
        "content": content,
        "tags": tags or [],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "pinned": False
    }
    
    # Store note
    r.set(note_id, json.dumps(note))
    
    # Add to coordinator's notes list
    r.sadd(f"coordinator:{coordinator_email}:notes", note_id)
    
    # Add to tag indexes
    if tags:
        for tag in tags:
            r.sadd(f"tag:{tag}:notes", note_id)
    
    return note


def get_notes(coordinator_email: str, tag: Optional[str] = None) -> List[dict]:
    """Get all notes for a coordinator, optionally filtered by tag."""
    r = get_redis_client()
    
    if tag:
        # Get notes with specific tag
        note_ids = r.smembers(f"tag:{tag}:notes")
        # Filter by coordinator
        coordinator_notes = r.smembers(f"coordinator:{coordinator_email}:notes")
        note_ids = note_ids.intersection(coordinator_notes)
    else:
        # Get all notes for coordinator
        note_ids = r.smembers(f"coordinator:{coordinator_email}:notes")
    
    notes = []
    for note_id in note_ids:
        note_data = r.get(note_id)
        if note_data:
            notes.append(json.loads(note_data))
    
    # Sort by created_at (newest first)
    notes.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    # Sort pinned notes to top
    notes.sort(key=lambda x: x.get('pinned', False), reverse=True)
    
    return notes


def update_note(note_id: str, content: Optional[str] = None, tags: Optional[List[str]] = None, pinned: Optional[bool] = None) -> dict:
    """Update a note."""
    r = get_redis_client()
    
    note_data = r.get(note_id)
    if not note_data:
        raise ValueError("Note not found")
    
    note = json.loads(note_data)
    
    # Remove old tag indexes
    if tags is not None and tags != note.get('tags'):
        old_tags = note.get('tags', [])
        for tag in old_tags:
            r.srem(f"tag:{tag}:notes", note_id)
        
        # Add new tag indexes
        for tag in tags:
            r.sadd(f"tag:{tag}:notes", note_id)
        
        note['tags'] = tags
    
    if content is not None:
        note['content'] = content
    
    if pinned is not None:
        note['pinned'] = pinned
    
    note['updated_at'] = datetime.utcnow().isoformat()
    
    r.set(note_id, json.dumps(note))
    
    return note


def delete_note(note_id: str, coordinator_email: str) -> bool:
    """Delete a note."""
    r = get_redis_client()
    
    note_data = r.get(note_id)
    if not note_data:
        return False
    
    note = json.loads(note_data)
    
    # Verify ownership
    if note.get('coordinator_email') != coordinator_email:
        raise PermissionError("Not authorized to delete this note")
    
    # Remove from tag indexes
    for tag in note.get('tags', []):
        r.srem(f"tag:{tag}:notes", note_id)
    
    # Remove from coordinator's notes list
    r.srem(f"coordinator:{coordinator_email}:notes", note_id)
    
    # Delete note
    r.delete(note_id)
    
    return True


def get_all_tags(coordinator_email: str) -> List[str]:
    """Get all unique tags used by a coordinator."""
    r = get_redis_client()
    
    note_ids = r.smembers(f"coordinator:{coordinator_email}:notes")
    tags = set()
    
    for note_id in note_ids:
        note_data = r.get(note_id)
        if note_data:
            note = json.loads(note_data)
            tags.update(note.get('tags', []))
    
    return sorted(list(tags))


def search_notes(coordinator_email: str, query: str) -> List[dict]:
    """Simple search through notes content."""
    r = get_redis_client()
    
    note_ids = r.smembers(f"coordinator:{coordinator_email}:notes")
    matching_notes = []
    
    query_lower = query.lower()
    
    for note_id in note_ids:
        note_data = r.get(note_id)
        if note_data:
            note = json.loads(note_data)
            content_lower = note.get('content', '').lower()
            tags_lower = [t.lower() for t in note.get('tags', [])]
            
            if query_lower in content_lower or any(query_lower in tag for tag in tags_lower):
                matching_notes.append(note)
    
    # Sort by relevance (exact match first, then partial)
    matching_notes.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return matching_notes
