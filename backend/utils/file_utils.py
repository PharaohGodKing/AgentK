import aiofiles
import shutil
from pathlib import Path
from typing import List, Dict, Any
from fastapi import UploadFile
from backend.core.config import settings

async def save_upload_file(file: UploadFile, directory: str = "") -> Path:
    """Save an uploaded file to the specified directory"""
    upload_path = Path(settings.UPLOAD_PATH)
    directory_path = upload_path / directory
    directory_path.mkdir(parents=True, exist_ok=True)
    
    file_path = directory_path / file.filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return file_path

async def get_file_info(file_path: Path) -> Dict[str, Any]:
    """Get information about a file"""
    if not file_path.exists() or not file_path.is_file():
        return {}
    
    stat = file_path.stat()
    return {
        "name": file_path.name,
        "path": str(file_path.relative_to(settings.UPLOAD_PATH)),
        "size": stat.st_size,
        "size_human": _format_size(stat.st_size),
        "modified": stat.st_mtime,
        "extension": file_path.suffix.lower()
    }

async def list_files(directory: str = "") -> List[Dict[str, Any]]:
    """List files in the specified directory"""
    upload_path = Path(settings.UPLOAD_PATH)
    directory_path = upload_path / directory
    
    if not directory_path.exists():
        return []
    
    files = []
    for file_path in directory_path.iterdir():
        if file_path.is_file():
            file_info = await get_file_info(file_path)
            files.append(file_info)
    
    return files

def _format_size(size_bytes: int) -> str:
    """Format file size in human-readable format"""
    if size_bytes == 0:
        return "0B"
    
    units = ["B", "KB", "MB", "GB", "TB"]
    import math
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {units[i]}"