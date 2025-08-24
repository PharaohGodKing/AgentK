from typing import List, Dict, Any
from pathlib import Path
import aiofiles
import shutil
from fastapi import UploadFile
from backend.core.config import settings

class FileService:
    def __init__(self):
        self.upload_path = Path(settings.UPLOAD_PATH)
        self.upload_path.mkdir(parents=True, exist_ok=True)
    
    async def save_upload_file(self, file: UploadFile, directory: str = "") -> Path:
        """Save an uploaded file to the specified directory"""
        directory_path = self.upload_path / directory
        directory_path.mkdir(parents=True, exist_ok=True)
        
        file_path = directory_path / file.filename
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return file_path
    
    async def list_files(self, directory: str = "") -> List[Dict[str, Any]]:
        """List files in the specified directory"""
        directory_path = self.upload_path / directory
        
        if not directory_path.exists():
            return []
        
        files = []
        for file_path in directory_path.iterdir():
            if file_path.is_file():
                files.append({
                    "name": file_path.name,
                    "path": str(file_path.relative_to(self.upload_path)),
                    "size": file_path.stat().st_size,
                    "modified": file_path.stat().st_mtime
                })
        
        return files
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete a file"""
        full_path = self.upload_path / file_path
        
        if not full_path.exists():
            return False
        
        try:
            if full_path.is_file():
                full_path.unlink()
            else:
                shutil.rmtree(full_path)
            return True
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
            return False
    
    async def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """Get information about a file"""
        full_path = self.upload_path / file_path
        
        if not full_path.exists() or not full_path.is_file():
            return {}
        
        stat = full_path.stat()
        return {
            "name": full_path.name,
            "path": str(full_path.relative_to(self.upload_path)),
            "size": stat.st_size,
            "size_human": self._format_size(stat.st_size),
            "modified": stat.st_mtime,
            "extension": full_path.suffix.lower()
        }
    
    def _format_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format"""
        if size_bytes == 0:
            return "0B"
        
        units = ["B", "KB", "MB", "GB", "TB"]
        import math
        i = int(math.floor(math.log(size_bytes, 1024)))
        p = math.pow(1024, i)
        s = round(size_bytes / p, 2)
        return f"{s} {units[i]}"