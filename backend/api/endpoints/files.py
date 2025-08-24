from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
import shutil
import os
from pathlib import Path
from typing import List
from backend.core.config import settings
from backend.utils.file_utils import save_upload_file, get_file_info, list_files

router = APIRouter()

@router.get("/")
async def list_uploaded_files(directory: str = ""):
    """List all uploaded files"""
    try:
        upload_path = Path(settings.UPLOAD_PATH) / directory
        files = list_files(upload_path)
        return {"directory": directory, "files": files}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing files: {str(e)}"
        )

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    directory: str = Form(""),
    agent_id: str = Form(None)
):
    """Upload a file"""
    try:
        file_path = await save_upload_file(file, directory)
        file_info = get_file_info(file_path)
        
        # In a real implementation, you might store file metadata in database
        # and associate it with an agent if agent_id is provided
        
        return {
            "success": True,
            "filename": file.filename,
            "file_path": str(file_path),
            "file_info": file_info,
            "agent_id": agent_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.get("/download/{file_path:path}")
async def download_file(file_path: str):
    """Download a file (placeholder - would use FileResponse in real implementation)"""
    full_path = Path(settings.UPLOAD_PATH) / file_path
    
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # In a real implementation, you would return a FileResponse
    return {
        "success": True,
        "file_path": str(full_path),
        "message": "File would be downloaded in real implementation"
    }

@router.delete("/{file_path:path}")
async def delete_file(file_path: str):
    """Delete a file"""
    full_path = Path(settings.UPLOAD_PATH) / file_path
    
    if not full_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        if full_path.is_file():
            full_path.unlink()
        else:
            shutil.rmtree(full_path)
        
        return {"success": True, "message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )