"""
File processor plugin for AgentK - Handles file operations
"""

import aiofiles
import os
import json
import csv
from pathlib import Path
from typing import Dict, Any, List
from plugins.base_plugin import BasePlugin
import logging

logger = logging.getLogger(__name__)

class FileProcessor(BasePlugin):
    """
    File processor plugin that handles file operations like read, write, and processing
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.name = "File Processor"
        self.version = "1.0.0"
        self.description = "Handles file operations including reading, writing, and processing various file formats"
        self.capabilities = ["file_read", "file_write", "file_process", "data_extraction"]
        
        # Default configuration
        self.base_path = self.get_config_value("base_path", "./data/files")
        self.allowed_extensions = self.get_config_value("allowed_extensions", [".txt", ".json", ".csv", ".md"])
        
        # Create base directory if it doesn't exist
        Path(self.base_path).mkdir(parents=True, exist_ok=True)
    
    async def initialize(self) -> None:
        """Initialize the file processor plugin"""
        await super().initialize()
        logger.info("File Processor plugin initialized")
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a file operation
        
        Args:
            parameters: Should contain 'operation' and operation-specific parameters
            
        Returns:
            Dictionary with operation results
        """
        operation = parameters.get("operation")
        
        if not operation:
            return {
                "success": False,
                "error": "Missing required parameter: operation"
            }
        
        try:
            if operation == "read":
                return await self._read_file(parameters)
            elif operation == "write":
                return await self._write_file(parameters)
            elif operation == "list":
                return await self._list_files(parameters)
            elif operation == "delete":
                return await self._delete_file(parameters)
            elif operation == "process":
                return await self._process_file(parameters)
            else:
                return {
                    "success": False,
                    "error": f"Unknown operation: {operation}"
                }
                
        except Exception as e:
            logger.error(f"File operation failed: {e}")
            return {
                "success": False,
                "error": f"Operation failed: {str(e)}",
                "operation": operation
            }
    
    async def _read_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Read a file"""
        if not self.validate_parameters(parameters, ["filename"]):
            return {
                "success": False,
                "error": "Missing required parameter: filename"
            }
        
        filename = parameters["filename"]
        filepath = self._get_full_path(filename)
        
        # Security check
        if not self._is_valid_path(filepath):
            return {
                "success": False,
                "error": "Invalid file path"
            }
        
        if not os.path.exists(filepath):
            return {
                "success": False,
                "error": f"File not found: {filename}"
            }
        
        try:
            async with aiofiles.open(filepath, 'r', encoding='utf-8') as f:
                content = await f.read()
            
            # Try to parse structured data if possible
            parsed_content = self._try_parse_content(content, filename)
            
            return {
                "success": True,
                "filename": filename,
                "content": content,
                "parsed": parsed_content,
                "size": len(content)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to read file: {str(e)}",
                "filename": filename
            }
    
    async def _write_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Write to a file"""
        if not self.validate_parameters(parameters, ["filename", "content"]):
            return {
                "success": False,
                "error": "Missing required parameters: filename and content"
            }
        
        filename = parameters["filename"]
        content = parameters["content"]
        filepath = self._get_full_path(filename)
        
        # Security check
        if not self._is_valid_path(filepath):
            return {
                "success": False,
                "error": "Invalid file path"
            }
        
        # Check file extension
        if not self._is_allowed_extension(filename):
            return {
                "success": False,
                "error": f"File extension not allowed: {Path(filename).suffix}"
            }
        
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            async with aiofiles.open(filepath, 'w', encoding='utf-8') as f:
                await f.write(content)
            
            return {
                "success": True,
                "filename": filename,
                "message": "File written successfully",
                "size": len(content)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to write file: {str(e)}",
                "filename": filename
            }
    
    async def _list_files(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """List files in a directory"""
        directory = parameters.get("directory", "")
        dirpath = self._get_full_path(directory)
        
        # Security check
        if not self._is_valid_path(dirpath):
            return {
                "success": False,
                "error": "Invalid directory path"
            }
        
        try:
            files = []
            for item in os.listdir(dirpath):
                item_path = os.path.join(dirpath, item)
                if os.path.isfile(item_path) and self._is_allowed_extension(item):
                    files.append({
                        "name": item,
                        "size": os.path.getsize(item_path),
                        "modified": os.path.getmtime(item_path)
                    })
            
            return {
                "success": True,
                "directory": directory,
                "files": files,
                "count": len(files)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to list files: {str(e)}",
                "directory": directory
            }
    
    async def _delete_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Delete a file"""
        if not self.validate_parameters(parameters, ["filename"]):
            return {
                "success": False,
                "error": "Missing required parameter: filename"
            }
        
        filename = parameters["filename"]
        filepath = self._get_full_path(filename)
        
        # Security check
        if not self._is_valid_path(filepath):
            return {
                "success": False,
                "error": "Invalid file path"
            }
        
        if not os.path.exists(filepath):
            return {
                "success": False,
                "error": f"File not found: {filename}"
            }
        
        try:
            os.remove(filepath)
            return {
                "success": True,
                "filename": filename,
                "message": "File deleted successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to delete file: {str(e)}",
                "filename": filename
            }
    
    async def _process_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Process a file (extract data, transform, etc.)"""
        if not self.validate_parameters(parameters, ["filename", "process_type"]):
            return {
                "success": False,
                "error": "Missing required parameters: filename and process_type"
            }
        
        filename = parameters["filename"]
        process_type = parameters["process_type"]
        filepath = self._get_full_path(filename)
        
        # First read the file
        read_result = await self._read_file({"filename": filename})
        if not read_result["success"]:
            return read_result
        
        content = read_result["content"]
        
        try:
            if process_type == "extract_text":
                # Simple text extraction (already have the content)
                return {
                    "success": True,
                    "filename": filename,
                    "process_type": process_type,
                    "result": content,
                    "length": len(content)
                }
                
            elif process_type == "word_count":
                words = content.split()
                return {
                    "success": True,
                    "filename": filename,
                    "process_type": process_type,
                    "word_count": len(words),
                    "character_count": len(content)
                }
                
            else:
                return {
                    "success": False,
                    "error": f"Unknown process type: {process_type}",
                    "filename": filename
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"File processing failed: {str(e)}",
                "filename": filename,
                "process_type": process_type
            }
    
    def _get_full_path(self, filename: str) -> str:
        """Get the full path for a file"""
        return os.path.join(self.base_path, filename)
    
    def _is_valid_path(self, path: str) -> bool:
        """Check if a path is valid and within the allowed directory"""
        try:
            full_path = os.path.abspath(path)
            base_path = os.path.abspath(self.base_path)
            return full_path.startswith(base_path)
        except:
            return False
    
    def _is_allowed_extension(self, filename: str) -> bool:
        """Check if a file extension is allowed"""
        ext = Path(filename).suffix.lower()
        return ext in self.allowed_extensions
    
    def _try_parse_content(self, content: str, filename: str) -> Any:
        """Try to parse file content based on extension"""
        ext = Path(filename).suffix.lower()
        
        try:
            if ext == '.json':
                return json.loads(content)
            elif ext == '.csv':
                # Parse CSV into list of dictionaries
                lines = content.splitlines()
                reader = csv.DictReader(lines)
                return list(reader)
            else:
                return None
        except:
            return None
    
    async def cleanup(self) -> None:
        """Clean up resources"""
        await super().cleanup()
        logger.info("File Processor plugin cleaned up")