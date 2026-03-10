"""
Email notification endpoints.
Send emails to volunteers using Resend API.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from app.emails import send_email, send_bulk_emails
from app.database import get_db
from supabase import Client


router = APIRouter(prefix="/emails", tags=["Emails"])


class EmailRequest(BaseModel):
    to_emails: List[str]
    subject: str
    html_content: str


class TemplateEmailRequest(BaseModel):
    to_emails: List[str]
    template: str  # "welcome", "reminder", "thankyou", "event"
    volunteer_name: Optional[str] = "Volunteer"
    custom_message: Optional[str] = ""
    event_name: Optional[str] = ""


# Built-in email templates
TEMPLATES = {
    "welcome": {
        "subject": "Welcome to MissionMatch! 🎉",
        "html": """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome to MissionMatch!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; color: #374151;">Hi {name},</p>
                <p style="font-size: 16px; color: #374151;">We're thrilled to have you join our community of advocates! Your passion for making a difference is what drives our mission forward.</p>
                <p style="font-size: 16px; color: #374151;">{message}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Get Started</a>
                </div>
                <p style="font-size: 14px; color: #6b7280;">— The MissionMatch Team</p>
            </div>
        </div>
        """
    },
    "reminder": {
        "subject": "We miss you! Come back to MissionMatch 💜",
        "html": """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">We Miss You!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; color: #374151;">Hi {name},</p>
                <p style="font-size: 16px; color: #374151;">It's been a while since we last heard from you. Your contributions have made such a meaningful impact, and we'd love to see you back in action!</p>
                <p style="font-size: 16px; color: #374151;">{message}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Check New Opportunities</a>
                </div>
                <p style="font-size: 14px; color: #6b7280;">— The MissionMatch Team</p>
            </div>
        </div>
        """
    },
    "thankyou": {
        "subject": "Thank you for your impact! 🌟",
        "html": """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Thank You! 🌟</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; color: #374151;">Hi {name},</p>
                <p style="font-size: 16px; color: #374151;">We wanted to take a moment to recognize your incredible contributions. Volunteers like you are the backbone of our mission!</p>
                <p style="font-size: 16px; color: #374151;">{message}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Your Impact</a>
                </div>
                <p style="font-size: 14px; color: #6b7280;">— The MissionMatch Team</p>
            </div>
        </div>
        """
    },
    "event": {
        "subject": "New Campaign: {event} 📢",
        "html": """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">New Campaign Alert! 📢</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; color: #374151;">Hi {name},</p>
                <p style="font-size: 16px; color: #374151;">We have an exciting new campaign that could use your skills: <strong>{event}</strong></p>
                <p style="font-size: 16px; color: #374151;">{message}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Campaign Details</a>
                </div>
                <p style="font-size: 14px; color: #6b7280;">— The MissionMatch Team</p>
            </div>
        </div>
        """
    },
}


@router.post("/send", summary="Send custom email to volunteers")
async def send_custom_email(request: EmailRequest):
    """Send a custom email to one or more volunteers."""
    try:
        if len(request.to_emails) == 1:
            result = send_email(request.to_emails[0], request.subject, request.html_content)
            return {"message": "Email sent successfully", "result": result}
        else:
            results = send_bulk_emails(request.to_emails, request.subject, request.html_content)
            sent = sum(1 for r in results if r["status"] == "sent")
            return {
                "message": f"Sent {sent}/{len(results)} emails",
                "results": results,
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


@router.post("/send-template", summary="Send templated email to volunteers")
async def send_template_email(request: TemplateEmailRequest):
    """Send a pre-built template email to volunteers."""
    if request.template not in TEMPLATES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown template: {request.template}. Available: {list(TEMPLATES.keys())}"
        )
    
    template = TEMPLATES[request.template]
    subject = template["subject"].replace("{event}", request.event_name or "")
    html = template["html"].replace("{name}", request.volunteer_name or "Volunteer")
    html = html.replace("{message}", request.custom_message or "")
    html = html.replace("{event}", request.event_name or "")
    
    try:
        if len(request.to_emails) == 1:
            result = send_email(request.to_emails[0], subject, html)
            return {"message": "Template email sent successfully", "result": result}
        else:
            results = send_bulk_emails(request.to_emails, subject, html)
            sent = sum(1 for r in results if r["status"] == "sent")
            return {
                "message": f"Sent {sent}/{len(results)} template emails",
                "results": results,
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send template email: {str(e)}"
        )


@router.get("/templates", summary="Get available email templates")
async def get_templates():
    """Return list of available email templates."""
    return {
        "templates": [
            {"id": "welcome", "name": "Welcome Email", "description": "Welcome new volunteers to the platform"},
            {"id": "reminder", "name": "Activity Reminder", "description": "Remind inactive volunteers to come back"},
            {"id": "thankyou", "name": "Thank You", "description": "Thank volunteers for their contributions"},
            {"id": "event", "name": "Campaign Announcement", "description": "Announce a new campaign to volunteers"},
        ]
    }


@router.get("/health", summary="Check email service health")
async def email_health():
    """Check if email service is configured."""
    from app.config import get_settings
    settings = get_settings()
    
    has_key = bool(settings.resend_api_key)
    return {
        "status": "configured" if has_key else "not_configured",
        "provider": "Resend",
        "message": "Email service is ready" if has_key else "Set RESEND_API_KEY in .env to enable emails",
    }
