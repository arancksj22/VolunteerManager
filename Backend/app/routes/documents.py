"""
Document storage endpoints for coordinators.
Simple S3 upload/download/delete functionality.
"""
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from typing import List
import io

from app.s3 import (
    upload_file_to_s3,
    get_file_from_s3,
    delete_file_from_s3,
    list_files_for_coordinator
)


router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    summary="Upload a document to S3"
)
async def upload_document(
    coordinator_email: str = Query(..., description="Coordinator's email"),
    file: UploadFile = File(...)
):
    """
    Upload a document to S3 storage.
    
    - Files are namespaced by coordinator email
    - Supported file types: PDF, DOCX, DOC, TXT, PNG, JPG, JPEG
    - Max file size: 10MB (enforced by frontend)
    """
    # Basic file type validation
    allowed_extensions = {'.pdf', '.docx', '.doc', '.txt', '.png', '.jpg', '.jpeg'}
    file_ext = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Upload to S3
        result = upload_file_to_s3(content, coordinator_email, file.filename)
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {result.get('error')}"
            )
        
        return {
            "message": "File uploaded successfully",
            "filename": result['filename'],
            "s3_key": result['s3_key']
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get(
    "/list",
    summary="List all documents for a coordinator"
)
async def list_documents(
    coordinator_email: str = Query(..., description="Coordinator's email")
):
    """
    List all documents uploaded by a coordinator.
    
    Returns list of files with metadata.
    """
    try:
        files = list_files_for_coordinator(coordinator_email)
        return {
            "coordinator_email": coordinator_email,
            "files": files,
            "count": len(files)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list files: {str(e)}"
        )


@router.get(
    "/download/{s3_key:path}",
    summary="Download a document from S3"
)
async def download_document(s3_key: str):
    """
    Download a document from S3.
    
    Returns the file as a streaming response.
    """
    try:
        file_content = get_file_from_s3(s3_key)
        
        if file_content is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Extract filename from s3_key
        filename = s3_key.split('/')[-1]
        
        # Determine content type
        content_type = "application/octet-stream"
        if filename.endswith('.pdf'):
            content_type = "application/pdf"
        elif filename.endswith(('.png', '.jpg', '.jpeg')):
            content_type = f"image/{filename.split('.')[-1]}"
        elif filename.endswith('.txt'):
            content_type = "text/plain"
        elif filename.endswith(('.doc', '.docx')):
            content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Download failed: {str(e)}"
        )


@router.delete(
    "/{s3_key:path}",
    summary="Delete a document from S3"
)
async def delete_document(s3_key: str):
    """
    Delete a document from S3.
    
    Permanently removes the file.
    """
    try:
        success = delete_file_from_s3(s3_key)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found or already deleted"
            )
        
        return {
            "message": "File deleted successfully",
            "s3_key": s3_key
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}"
        )
