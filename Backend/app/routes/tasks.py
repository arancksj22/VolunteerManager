"""
Task management and matching endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from uuid import UUID

from app.models import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    VolunteerMatch,
    MessageResponse
)
from app.database import get_db
from app.embeddings import encode_text
from app.config import get_settings
from supabase import Client


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task"
)
async def create_task(
    task: TaskCreate,
    db: Client = Depends(get_db)
):
    """
    Create a new task with semantic embedding.
    
    - Generates a 384-dimensional embedding from the description
    - Uses title and required_skills if description is empty
    """
    try:
        # Generate embedding from description or title + skills
        text_for_embedding = (
            task.description or 
            f"{task.title} {' '.join(task.required_skills)}"
        )
        task_vector = encode_text(text_for_embedding)
        
        # Prepare task data
        task_data = {
            "title": task.title,
            "description": task.description,
            "required_skills": task.required_skills,
            "task_vector": task_vector,
            "status": task.status or "open",
        }
        
        # Insert into database
        response = db.table("tasks").insert(task_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create task"
            )
        
        return response.data[0]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating task: {str(e)}"
        )


@router.get(
    "",
    response_model=List[TaskResponse],
    summary="List all tasks"
)
async def list_tasks(
    status_filter: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Client = Depends(get_db)
):
    """
    Retrieve all tasks with optional filtering.
    
    - Filter by status: 'open', 'filled', or 'completed'
    - Returns tasks ordered by creation date (newest first)
    """
    try:
        query = db.table("tasks").select("id, title, description, required_skills, status, created_at")
        
        # Apply status filter if provided
        if status_filter:
            allowed_statuses = ['open', 'filled', 'completed']
            if status_filter not in allowed_statuses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Status must be one of: {', '.join(allowed_statuses)}"
                )
            query = query.eq("status", status_filter)
        
        response = query.order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        return response.data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching tasks: {str(e)}"
        )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get task by ID"
)
async def get_task(
    task_id: UUID,
    db: Client = Depends(get_db)
):
    """Retrieve a specific task by its ID."""
    try:
        response = db.table("tasks")\
            .select("id, title, description, required_skills, status, created_at")\
            .eq("id", str(task_id))\
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found"
            )
        
        return response.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching task: {str(e)}"
        )


@router.get(
    "/{task_id}/matches",
    response_model=List[VolunteerMatch],
    summary="Find matching volunteers for a task (Routing Engine)"
)
async def match_volunteers_to_task(
    task_id: UUID,
    match_threshold: float = Query(None, ge=0.0, le=1.0),
    match_count: int = Query(None, ge=1, le=100),
    db: Client = Depends(get_db)
):
    """
    **THE ROUTING ENGINE** - Semantic matching of volunteers to tasks.
    
    - Retrieves the task's embedding vector
    - Calls the `match_volunteers` RPC function for cosine similarity search
    - Returns ranked list of volunteers with similarity scores
    
    Parameters:
    - match_threshold: Minimum similarity score (0.0-1.0), defaults to config value
    - match_count: Maximum number of matches to return, defaults to config value
    """
    try:
        settings = get_settings()
        
        # Use config defaults if not provided
        if match_threshold is None:
            match_threshold = settings.match_threshold
        if match_count is None:
            match_count = settings.default_match_count
        
        # Fetch the task and its vector
        task_response = db.table("tasks")\
            .select("task_vector")\
            .eq("id", str(task_id))\
            .execute()
        
        if not task_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found"
            )
        
        task_vector = task_response.data[0].get("task_vector")
        
        if not task_vector:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Task has no embedding vector"
            )
        
        # Call the match_volunteers RPC function
        match_response = db.rpc(
            "match_volunteers",
            {
                "query_embedding": task_vector,
                "match_threshold": match_threshold,
                "match_count": match_count
            }
        ).execute()
        
        return match_response.data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error matching volunteers: {str(e)}"
        )


@router.get(
    "/{task_id}/recommendations",
    response_model=List[VolunteerMatch],
    summary="Get volunteer recommendations (alias for matches)"
)
async def get_task_recommendations(
    task_id: UUID,
    match_threshold: float = Query(None, ge=0.0, le=1.0),
    match_count: int = Query(None, ge=1, le=100),
    db: Client = Depends(get_db)
):
    """
    Alias endpoint for `/tasks/{task_id}/matches`.
    Provides volunteer recommendations for a specific task.
    """
    return await match_volunteers_to_task(task_id, match_threshold, match_count, db)


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update task information"
)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    db: Client = Depends(get_db)
):
    """
    Update task information.
    
    - If description or required_skills are updated, regenerates the embedding
    - Preserves existing fields that aren't being updated
    """
    try:
        # Build update data (only include fields that were provided)
        update_data = task_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # If description or required_skills are being updated, regenerate embedding
        if "description" in update_data or "required_skills" in update_data or "title" in update_data:
            # Fetch current task to get existing data
            current = db.table("tasks")\
                .select("title, description, required_skills")\
                .eq("id", str(task_id))\
                .execute()
            
            if not current.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Task with ID {task_id} not found"
                )
            
            # Use updated fields or fall back to existing
            title = update_data.get("title") or current.data[0].get("title")
            description = update_data.get("description") or current.data[0].get("description")
            required_skills = update_data.get("required_skills") or current.data[0].get("required_skills", [])
            
            # Generate new embedding
            text_for_embedding = description or f"{title} {' '.join(required_skills)}"
            update_data["task_vector"] = encode_text(text_for_embedding)
        
        # Update in database (exclude task_vector from return since it's large)
        response = db.table("tasks")\
            .update(update_data)\
            .eq("id", str(task_id))\
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found"
            )
        
        # Return without the vector
        result = response.data[0]
        return {
            "id": result["id"],
            "title": result["title"],
            "description": result["description"],
            "required_skills": result["required_skills"],
            "status": result["status"],
            "created_at": result["created_at"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating task: {str(e)}"
        )


@router.delete(
    "/{task_id}",
    response_model=MessageResponse,
    summary="Delete task"
)
async def delete_task(
    task_id: UUID,
    db: Client = Depends(get_db)
):
    """Delete a task by ID."""
    try:
        response = db.table("tasks")\
            .delete()\
            .eq("id", str(task_id))\
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found"
            )
        
        return MessageResponse(
            message="Task deleted successfully",
            detail=f"Deleted task ID: {task_id}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting task: {str(e)}"
        )
