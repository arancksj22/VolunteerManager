"""
Volunteer management endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from uuid import UUID

from app.models import (
    VolunteerCreate,
    VolunteerUpdate,
    VolunteerResponse,
    VolunteerHealthStatus,
    MessageResponse
)
from app.database import get_db
from app.embeddings import encode_text
from supabase import Client


router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


@router.post(
    "/",
    response_model=VolunteerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new volunteer"
)
async def create_volunteer(
    volunteer: VolunteerCreate,
    db: Client = Depends(get_db)
):
    """
    Create a new volunteer profile with semantic embedding.
    
    - Generates a 384-dimensional embedding from the bio
    - Initializes engagement score at 100
    - Sets last_active_at to current timestamp
    """
    try:
        # Generate embedding from bio (or use skills if no bio)
        text_for_embedding = volunteer.bio or " ".join(volunteer.skills) or volunteer.full_name
        embedding = encode_text(text_for_embedding)
        
        # Prepare volunteer data
        volunteer_data = {
            "full_name": volunteer.full_name,
            "email": volunteer.email,
            "bio": volunteer.bio,
            "skills": volunteer.skills,
            "embedding": embedding,
            "engagement_score": 100,
        }
        
        # Insert into database
        response = db.table("volunteers").insert(volunteer_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create volunteer"
            )
        
        return response.data[0]
    
    except Exception as e:
        # Check for unique constraint violation (duplicate email)
        if "duplicate key" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Volunteer with email {volunteer.email} already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating volunteer: {str(e)}"
        )


@router.get(
    "/",
    response_model=List[VolunteerResponse],
    summary="List all volunteers"
)
async def list_volunteers(
    limit: int = 100,
    offset: int = 0,
    db: Client = Depends(get_db)
):
    """
    Retrieve all volunteers with pagination.
    
    - Returns volunteers ordered by creation date (newest first)
    - Includes current engagement scores
    """
    try:
        response = db.table("volunteers")\
            .select("*")\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        return response.data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching volunteers: {str(e)}"
        )


@router.get(
    "/health",
    response_model=List[VolunteerHealthStatus],
    summary="Get volunteer retention health status"
)
async def get_volunteer_health(
    status_filter: str = None,
    db: Client = Depends(get_db)
):
    """
    Retrieve volunteer retention health status from the database view.
    
    - Uses the `volunteer_retention_status` view
    - Calculates health based on: score - (days_inactive * 2)
    - Optional filter: 'Healthy', 'Warning', or 'At-Risk'
    """
    try:
        query = db.table("volunteer_retention_status").select("*")
        
        # Apply status filter if provided
        if status_filter:
            allowed_statuses = ['Healthy', 'Warning', 'At-Risk']
            if status_filter not in allowed_statuses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Status must be one of: {', '.join(allowed_statuses)}"
                )
            query = query.eq("status", status_filter)
        
        response = query.order("current_health", desc=False).execute()
        
        return response.data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching health status: {str(e)}"
        )


@router.get(
    "/{volunteer_id}",
    response_model=VolunteerResponse,
    summary="Get volunteer by ID"
)
async def get_volunteer(
    volunteer_id: UUID,
    db: Client = Depends(get_db)
):
    """Retrieve a specific volunteer by their ID."""
    try:
        response = db.table("volunteers")\
            .select("*")\
            .eq("id", str(volunteer_id))\
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Volunteer with ID {volunteer_id} not found"
            )
        
        return response.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching volunteer: {str(e)}"
        )


@router.patch(
    "/{volunteer_id}",
    response_model=VolunteerResponse,
    summary="Update volunteer information"
)
async def update_volunteer(
    volunteer_id: UUID,
    volunteer_update: VolunteerUpdate,
    db: Client = Depends(get_db)
):
    """
    Update volunteer information.
    
    - If bio or skills are updated, regenerates the embedding
    - Preserves existing fields that aren't being updated
    """
    try:
        # Build update data (only include fields that were provided)
        update_data = volunteer_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # If bio or skills are being updated, regenerate embedding
        if "bio" in update_data or "skills" in update_data:
            # Fetch current volunteer to get existing data
            current = db.table("volunteers")\
                .select("bio, skills")\
                .eq("id", str(volunteer_id))\
                .execute()
            
            if not current.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Volunteer with ID {volunteer_id} not found"
                )
            
            # Use updated bio/skills or fall back to existing
            bio = update_data.get("bio") or current.data[0].get("bio")
            skills = update_data.get("skills") or current.data[0].get("skills", [])
            
            # Generate new embedding
            text_for_embedding = bio or " ".join(skills) or ""
            update_data["embedding"] = encode_text(text_for_embedding)
        
        # Update in database
        response = db.table("volunteers")\
            .update(update_data)\
            .eq("id", str(volunteer_id))\
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Volunteer with ID {volunteer_id} not found"
            )
        
        return response.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating volunteer: {str(e)}"
        )


@router.delete(
    "/{volunteer_id}",
    response_model=MessageResponse,
    summary="Delete volunteer"
)
async def delete_volunteer(
    volunteer_id: UUID,
    db: Client = Depends(get_db)
):
    """
    Delete a volunteer by ID.
    
    - Cascading delete will remove associated activity logs
    """
    try:
        response = db.table("volunteers")\
            .delete()\
            .eq("id", str(volunteer_id))\
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Volunteer with ID {volunteer_id} not found"
            )
        
        return MessageResponse(
            message="Volunteer deleted successfully",
            detail=f"Deleted volunteer ID: {volunteer_id}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting volunteer: {str(e)}"
        )
