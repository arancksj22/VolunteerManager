"""
Simple AWS S3 integration for document storage.
Ultra-minimal implementation for coordinator document uploads.
"""
import boto3
from botocore.exceptions import ClientError
from typing import Optional
from app.config import get_settings


def get_s3_client():
    """Get configured S3 client."""
    settings = get_settings()
    
    client_config = {
        'aws_access_key_id': settings.s3_access_key_id,
        'aws_secret_access_key': settings.s3_secret_access_key,
        'region_name': settings.s3_region
    }
    
    # Add endpoint URL for Backblaze or other S3-compatible services
    if settings.aws_endpoint_url:
        client_config['endpoint_url'] = settings.aws_endpoint_url
    
    return boto3.client('s3', **client_config)


def generate_s3_key(coordinator_email: str, filename: str) -> str:
    """
    Generate S3 object key from coordinator email + filename.
    Format: coordinator@example.com/filename.pdf
    """
    # Sanitize email to be filesystem-safe
    safe_email = coordinator_email.replace('@', '_at_').replace('.', '_')
    return f"{safe_email}/{filename}"


def upload_file_to_s3(file_content: bytes, coordinator_email: str, filename: str) -> dict:
    """
    Upload a file to S3.
    
    Args:
        file_content: Raw file bytes
        coordinator_email: Coordinator's email (used for namespacing)
        filename: Original filename
    
    Returns:
        dict with s3_key and success status
    """
    settings = get_settings()
    s3_client = get_s3_client()
    s3_key = generate_s3_key(coordinator_email, filename)
    
    try:
        s3_client.put_object(
            Bucket=settings.aws_s3_bucket,
            Key=s3_key,
            Body=file_content
        )
        return {
            "success": True,
            "s3_key": s3_key,
            "filename": filename
        }
    except ClientError as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_file_from_s3(s3_key: str) -> Optional[bytes]:
    """
    Download a file from S3.
    
    Args:
        s3_key: Full S3 key path
    
    Returns:
        File content as bytes, or None if not found
    """
    settings = get_settings()
    s3_client = get_s3_client()
    
    try:
        response = s3_client.get_object(
            Bucket=settings.aws_s3_bucket,
            Key=s3_key
        )
        return response['Body'].read()
    except ClientError:
        return None


def delete_file_from_s3(s3_key: str) -> bool:
    """
    Delete a file from S3.
    
    Args:
        s3_key: Full S3 key path
    
    Returns:
        True if deleted successfully, False otherwise
    """
    settings = get_settings()
    s3_client = get_s3_client()
    
    try:
        s3_client.delete_object(
            Bucket=settings.aws_s3_bucket,
            Key=s3_key
        )
        return True
    except ClientError:
        return False


def list_files_for_coordinator(coordinator_email: str) -> list:
    """
    List all files for a specific coordinator.
    
    Args:
        coordinator_email: Coordinator's email
    
    Returns:
        List of file objects with key and size
    """
    settings = get_settings()
    s3_client = get_s3_client()
    prefix = generate_s3_key(coordinator_email, "").rstrip("/") + "/"
    
    try:
        response = s3_client.list_objects_v2(
            Bucket=settings.aws_s3_bucket,
            Prefix=prefix
        )
        
        if 'Contents' not in response:
            return []
        
        return [
            {
                "s3_key": obj['Key'],
                "filename": obj['Key'].split('/')[-1],
                "size": obj['Size'],
                "last_modified": obj['LastModified'].isoformat()
            }
            for obj in response['Contents']
        ]
    except ClientError:
        return []
