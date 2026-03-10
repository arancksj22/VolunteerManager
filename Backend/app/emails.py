"""
Email service using Resend API.
Sends emails to volunteers (welcome, reminders, custom messages).
"""
import resend
from app.config import get_settings


def configure_resend():
    """Configure Resend with API key."""
    settings = get_settings()
    resend.api_key = settings.resend_api_key


def send_email(to_email: str, subject: str, html_content: str, from_name: str = "MissionMatch") -> dict:
    """Send a single email via Resend."""
    configure_resend()
    
    params = {
        "from": f"{from_name} <onboarding@resend.dev>",
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    
    response = resend.Emails.send(params)
    return response


def send_bulk_emails(to_emails: list[str], subject: str, html_content: str, from_name: str = "MissionMatch") -> list[dict]:
    """Send the same email to multiple recipients."""
    configure_resend()
    
    results = []
    for email in to_emails:
        try:
            params = {
                "from": f"{from_name} <onboarding@resend.dev>",
                "to": [email],
                "subject": subject,
                "html": html_content,
            }
            response = resend.Emails.send(params)
            results.append({"email": email, "status": "sent", "id": response.get("id", "")})
        except Exception as e:
            results.append({"email": email, "status": "failed", "error": str(e)})
    
    return results
