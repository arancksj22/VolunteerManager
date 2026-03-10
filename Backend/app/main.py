"""
VolunteerManager Backend - FastAPI Application
Simple deployment ready for any Python server (Railway, Render, etc.)
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import sys
import traceback

from app.config import get_settings
from app.embeddings import get_embedding_engine
from app.models import HealthResponse, ErrorResponse
from app.routes import volunteers, tasks, activities, documents


# ============================================================================
# APPLICATION INITIALIZATION
# ============================================================================

app = FastAPI(
    title="VolunteerManager API",
    description="AI-native volunteer management platform with semantic matching and engagement tracking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# STARTUP & SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """
    Initialize resources at application startup.
    """
    print("=" * 60)
    print("🚀 VOLUNTEERMANAGER BACKEND STARTING UP")
    print("=" * 60)
    
    try:
        # Load settings
        settings = get_settings()
        print(f"📋 Environment: {settings.environment}")
        print(f"🗄️  Database: {settings.supabase_url}")
        
        # Initialize embedding engine (HuggingFace API)
        print("🧠 Initializing embedding engine...")
        embedding_engine = get_embedding_engine()
        
        print("=" * 60)
        print("✅ STARTUP COMPLETE")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ STARTUP ERROR: {str(e)}")
        traceback.print_exc()
        # Don't exit - let the app try to run


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    print("👋 VolunteerManager Backend shutting down...")


# ============================================================================
# GLOBAL EXCEPTION HANDLER
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler to prevent unhandled errors.
    """
    print(f"❌ Unhandled exception: {str(exc)}")
    traceback.print_exc()
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc) if get_settings().environment == "development" else "An error occurred",
            "status_code": 500
        }
    )


# ============================================================================
# ROOT & HEALTH ENDPOINTS
# ============================================================================

@app.get(
    "/",
    response_model=HealthResponse,
    tags=["System"]
)
async def root():
    """
    Root endpoint - API health check.
    """
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow()
    )


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"]
)
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    """
    try:
        # Test database connection
        from app.database import get_db
        db = get_db()
        
        # Simple query to verify DB connection
        result = db.table("volunteers").select("id").limit(1).execute()
        
        return HealthResponse(
            status="healthy",
            version="1.0.0",
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@app.get(
    "/info",
    tags=["System"]
)
async def system_info():
    """
    System information endpoint.
    """
    settings = get_settings()
    
    return {
        "application": "VolunteerManager API",
        "version": "1.0.0",
        "environment": settings.environment,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "embedding_model": settings.model_name,
        "embedding_dimensions": settings.embedding_dimension,
        "match_threshold": settings.match_threshold,
        "default_match_count": settings.default_match_count,
    }


# ============================================================================
# STATISTICS ENDPOINT
# ============================================================================

@app.get(
    "/stats",
    tags=["Statistics"],
    summary="Get dashboard statistics"
)
async def get_stats():
    """
    Aggregate statistics for the coordinator dashboard.
    """
    from app.database import get_db
    db = get_db()
    
    try:
        # Total volunteers
        vol_response = db.table("volunteers").select("id, engagement_score").execute()
        volunteers = vol_response.data or []
        total_volunteers = len(volunteers)
        
        scores = [v["engagement_score"] for v in volunteers if v.get("engagement_score") is not None]
        avg_engagement = sum(scores) / len(scores) if scores else 0
        
        # Health distribution from retention view
        healthy = warning = at_risk = 0
        try:
            health_response = db.table("volunteer_retention_status").select("status").execute()
            for row in (health_response.data or []):
                s = row.get("status", "")
                if s == "Healthy":
                    healthy += 1
                elif s == "Warning":
                    warning += 1
                elif s == "At-Risk":
                    at_risk += 1
        except Exception:
            pass
        
        # Activity count this month
        total_hours = 0
        try:
            act_response = db.table("activity_logs").select("id").execute()
            total_hours = len(act_response.data or [])
        except Exception:
            pass
        
        # Active volunteers (those with engagement_score > 50)
        active_volunteers = sum(1 for v in volunteers if v.get("engagement_score", 0) > 50)
        
        return {
            "total_volunteers": total_volunteers,
            "active_volunteers": active_volunteers,
            "at_risk_count": at_risk,
            "total_hours_this_month": total_hours,
            "avg_engagement_score": avg_engagement,
            "health_distribution": {
                "Healthy": healthy,
                "Warning": warning,
                "At-Risk": at_risk
            }
        }
    except Exception as e:
        return {
            "total_volunteers": 0,
            "active_volunteers": 0,
            "at_risk_count": 0,
            "total_hours_this_month": 0,
            "avg_engagement_score": 0,
            "health_distribution": {"Healthy": 0, "Warning": 0, "At-Risk": 0}
        }


# ============================================================================
# INCLUDE ROUTERS
# ============================================================================

app.include_router(volunteers.router)
app.include_router(tasks.router)
app.include_router(activities.router)
app.include_router(documents.router)


# ============================================================================
# AWS LAMBDA HANDLER (for serverless deployment)
# ============================================================================

try:
    from mangum import Mangum
    # Mangum adapter converts ASGI (FastAPI) to AWS Lambda handler
    handler = Mangum(app, lifespan="off")
except ImportError:
    # Mangum not installed - Lambda deployment not available
    # (Only needed if deploying to AWS Lambda)
    pass


# ============================================================================
# LOCAL DEVELOPMENT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("🚀 Starting VolunteerManager Backend in LOCAL MODE")
    print("📖 API Docs: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
