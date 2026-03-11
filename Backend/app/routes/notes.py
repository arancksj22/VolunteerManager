"""
API routes for Redis-based notes.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional

from ..redisnotes import (
    create_note,
    get_notes,
    update_note,
    delete_note,
    get_all_tags,
    search_notes
)

router = APIRouter(prefix="/notes", tags=["notes"])


class CreateNoteRequest(BaseModel):
    coordinator_email: str
    content: str
    tags: List[str] = []


class UpdateNoteRequest(BaseModel):
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    pinned: Optional[bool] = None


class NoteResponse(BaseModel):
    id: str
    coordinator_email: str
    content: str
    tags: List[str]
    created_at: str
    updated_at: str
    pinned: bool


@router.post("/", response_model=NoteResponse)
async def create_note_endpoint(request: CreateNoteRequest):
    """Create a new note."""
    try:
        note = create_note(
            coordinator_email=request.coordinator_email,
            content=request.content,
            tags=request.tags
        )
        return note
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[NoteResponse])
async def get_notes_endpoint(
    coordinator_email: str = Query(..., description="Coordinator's email"),
    tag: Optional[str] = Query(None, description="Filter by tag")
):
    """Get all notes for a coordinator."""
    try:
        notes = get_notes(coordinator_email=coordinator_email, tag=tag)
        return notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=List[NoteResponse])
async def search_notes_endpoint(
    coordinator_email: str = Query(..., description="Coordinator's email"),
    q: str = Query(..., description="Search query")
):
    """Search notes by content or tags."""
    try:
        notes = search_notes(coordinator_email=coordinator_email, query=q)
        return notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tags")
async def get_tags_endpoint(coordinator_email: str = Query(..., description="Coordinator's email")):
    """Get all tags used by a coordinator."""
    try:
        tags = get_all_tags(coordinator_email=coordinator_email)
        return {"tags": tags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note_endpoint(note_id: str, request: UpdateNoteRequest):
    """Update a note."""
    try:
        note = update_note(
            note_id=note_id,
            content=request.content,
            tags=request.tags,
            pinned=request.pinned
        )
        return note
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{note_id}")
async def delete_note_endpoint(
    note_id: str,
    coordinator_email: str = Query(..., description="Coordinator's email")
):
    """Delete a note."""
    try:
        success = delete_note(note_id=note_id, coordinator_email=coordinator_email)
        if not success:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"message": "Note deleted successfully"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for Redis connection."""
    try:
        from ..redisnotes import get_redis_client
        r = get_redis_client()
        r.ping()
        return {"status": "healthy", "redis": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Redis unavailable: {str(e)}")
