"""
Activity logging and engagement scoring endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from uuid import UUID
from datetime import datetime

from app.models import (
    ActivityLogCreate,
    ActivityLogResponse,
    MessageResponse
)
from app.database import get_db
from app.config import get_settings
from supabase import Client


router = APIRouter(prefix="/activities", tags=["Activities"])


def get_points_for_activity(activity_type: str) -> int:
    """
    Get default points for an activity type.
    Can be customized via config or overridden when creating the log.
    """
    settings = get_settings()
    
    points_map = {
        "signup": settings.points_signup,
        "task_completion": settings.points_task_completion,
        "check_in": settings.points_check_in,
        "custom": 0  # Must be explicitly provided
    }
    
    return points_map.get(activity_type, 0)


@router.post(
    "/",
    response_model=ActivityLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log volunteer activity (Engagement Pulse)"
)
async def log_activity(
    activity: ActivityLogCreate,
    db: Client = Depends(get_db)
):
    """
    **THE ENGAGEMENT PULSE** - Log volunteer activity and update engagement score.
    
    - Records the activity in activity_logs table
    - Updates the volunteer's engagement_score
    - Updates the volunteer's last_active_at timestamp
    
    Activity Types:
    - signup: Initial registration (10 points)
    - task_completion: Completed a task (50 points)
    - check_in: Regular check-in or update (5 points)
    - custom: Custom activity (must provide points_awarded)
    """
    try:
        # Determine points (use provided or default)
        if activity.points_awarded is None:
            points = get_points_for_activity(activity.activity_type)
            if points == 0 and activity.activity_type == "custom":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Custom activities must include points_awarded"
                )
        else:
            points = activity.points_awarded
        
        # Verify volunteer exists
        volunteer_check = db.table("volunteers")\
            .select("id, engagement_score")\
            .eq("id", str(activity.volunteer_id))\
            .execute()
        
        if not volunteer_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Volunteer with ID {activity.volunteer_id} not found"
            )
        
        current_score = volunteer_check.data[0].get("engagement_score", 100)
        
        # Insert activity log
        log_data = {
            "volunteer_id": str(activity.volunteer_id),
            "activity_type": activity.activity_type,
            "points_awarded": points
        }
        
        log_response = db.table("activity_logs").insert(log_data).execute()
        
        if not log_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create activity log"
            )
        
        # Update volunteer: increment score and update last_active_at
        new_score = current_score + points
        update_response = db.table("volunteers")\
            .update({
                "engagement_score": new_score,
                "last_active_at": datetime.utcnow().isoformat()
            })\
            .eq("id", str(activity.volunteer_id))\
            .execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update volunteer engagement score"
            )
        
        return log_response.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error logging activity: {str(e)}"
        )


@router.get(
    "/",
    response_model=List[ActivityLogResponse],
    summary="Get all activity logs"
)
async def list_activities(
    limit: int = 100,
    offset: int = 0,
    db: Client = Depends(get_db)
):
    """
    Retrieve all activity logs with pagination.
    
    - Returns logs ordered by creation date (newest first)
    """
    try:
        response = db.table("activity_logs")\
            .select("*")\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        return response.data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching activity logs: {str(e)}"
        )


@router.get(
    "/volunteer/{volunteer_id}",
    response_model=List[ActivityLogResponse],
    summary="Get activity logs for a specific volunteer"
)
async def get_volunteer_activities(
    volunteer_id: UUID,
    limit: int = 50,
    offset: int = 0,
    db: Client = Depends(get_db)
):
    """
    Retrieve all activity logs for a specific volunteer.
    
    - Useful for tracking individual volunteer engagement history
    """
    try:
        response = db.table("activity_logs")\
            .select("*")\
            .eq("volunteer_id", str(volunteer_id))\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        return response.data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching volunteer activities: {str(e)}"
        )


@router.get(
    "/{activity_id}",
    response_model=ActivityLogResponse,
    summary="Get specific activity log"
)
async def get_activity(
    activity_id: int,
    db: Client = Depends(get_db)
):
    """Retrieve a specific activity log by its ID."""
    try:
        response = db.table("activity_logs")\
            .select("*")\
            .eq("id", activity_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Activity log with ID {activity_id} not found"
            )
        
        return response.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching activity log: {str(e)}"
        )


@router.delete(
    "/{activity_id}",
    response_model=MessageResponse,
    summary="Delete activity log"
)
async def delete_activity(
    activity_id: int,
    db: Client = Depends(get_db)
):
    """
    Delete an activity log by ID.
    
    Note: This does NOT reverse the engagement score change.
    Use this for correcting data entry errors only.
    """
    try:
        response = db.table("activity_logs")\
            .delete()\
            .eq("id", activity_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Activity log with ID {activity_id} not found"
            )
        
        return MessageResponse(
            message="Activity log deleted successfully",
            detail=f"Deleted activity log ID: {activity_id}. Note: Engagement score was not reversed."
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting activity log: {str(e)}"
        )
