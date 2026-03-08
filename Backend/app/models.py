"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from datetime import datetime
from uuid import UUID


# ============================================================================
# VOLUNTEER MODELS
# ============================================================================

class VolunteerCreate(BaseModel):
    """Schema for creating a new volunteer."""
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    bio: Optional[str] = Field(None, max_length=2000)
    skills: Optional[List[str]] = Field(default_factory=list)
    
    @validator('skills')
    def validate_skills(cls, v):
        if v is None:
            return []
        # Remove empty strings and duplicates
        skills = [s.strip() for s in v if s.strip()]
        return list(set(skills))


class VolunteerUpdate(BaseModel):
    """Schema for updating volunteer information."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    bio: Optional[str] = Field(None, max_length=2000)
    skills: Optional[List[str]] = None
    
    @validator('skills')
    def validate_skills(cls, v):
        if v is None:
            return None
        skills = [s.strip() for s in v if s.strip()]
        return list(set(skills))


class VolunteerResponse(BaseModel):
    """Response schema for volunteer data."""
    id: UUID
    full_name: str
    email: str
    bio: Optional[str]
    skills: List[str]
    engagement_score: int
    last_active_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class VolunteerHealthStatus(BaseModel):
    """Health status for a volunteer based on retention view."""
    id: UUID
    full_name: str
    email: str
    current_health: int
    status: str  # 'Healthy', 'Warning', 'At-Risk'


class VolunteerMatch(BaseModel):
    """Schema for matched volunteer with similarity score."""
    id: UUID
    full_name: str
    bio: Optional[str]
    similarity: float = Field(..., ge=0.0, le=1.0)


# ============================================================================
# TASK MODELS
# ============================================================================

class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    required_skills: Optional[List[str]] = Field(default_factory=list)
    status: Optional[str] = Field(default="open")
    
    @validator('required_skills')
    def validate_skills(cls, v):
        if v is None:
            return []
        skills = [s.strip() for s in v if s.strip()]
        return list(set(skills))
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['open', 'filled', 'completed']
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class TaskUpdate(BaseModel):
    """Schema for updating task information."""
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    status: Optional[str] = None
    
    @validator('required_skills')
    def validate_skills(cls, v):
        if v is None:
            return None
        skills = [s.strip() for s in v if s.strip()]
        return list(set(skills))
    
    @validator('status')
    def validate_status(cls, v):
        if v is None:
            return None
        allowed_statuses = ['open', 'filled', 'completed']
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class TaskResponse(BaseModel):
    """Response schema for task data."""
    id: UUID
    title: str
    description: Optional[str]
    required_skills: List[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TaskWithMatches(BaseModel):
    """Task with recommended volunteers."""
    task: TaskResponse
    matches: List[VolunteerMatch]


# ============================================================================
# ACTIVITY LOG MODELS
# ============================================================================

class ActivityLogCreate(BaseModel):
    """Schema for creating an activity log."""
    volunteer_id: UUID
    activity_type: str
    points_awarded: Optional[int] = None
    
    @validator('activity_type')
    def validate_activity_type(cls, v):
        allowed_types = ['signup', 'task_completion', 'check_in', 'custom']
        if v not in allowed_types:
            raise ValueError(
                f"Activity type must be one of: {', '.join(allowed_types)}"
            )
        return v


class ActivityLogResponse(BaseModel):
    """Response schema for activity log."""
    id: int
    volunteer_id: UUID
    activity_type: str
    points_awarded: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# GENERAL MODELS
# ============================================================================

class HealthResponse(BaseModel):
    """API health check response."""
    status: str
    version: str
    timestamp: datetime


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
    detail: Optional[str] = None
    status_code: int
