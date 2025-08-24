import subprocess
import tempfile
import os
import ast
import json
from typing import Dict, Any
from plugins.base_plugin import BasePlugin
import logging

logger = logging.getLogger(__name__)

class CodeExecutor(BasePlugin):
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.name = "Code Executor"
        self.version = "1.0.0"
        self.description = "Executes code in various programming languages safely"
        self.capabilities = ["code_execution", "python", "javascript", "shell"]
        
        # Default configuration
        self.timeout = self.get_config_value("timeout", 30)
        self.max_output_length = self.get_config_value("max_output_length", 10000)
        self.allowed_languages = self.get_config_value("allowed_languages", ["python", "javascript", "shell"])
        
        # Security settings
        self.sandboxed = self.get_config_value("sandboxed", True)
        self.allow_network = self.get_config_value("allow_network", False)
        self.allow_file_access = self.get_config_value("allow_file_access", False)
    
    async def initialize(self) -> None:
        """Initialize the code executor plugin"""
        await super().initialize()
        logger.info("Code Executor plugin initialized")
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute code in a specific language
        
        Args:
            parameters: Should contain 'code' and 'language'
            
        Returns:
            Dictionary with execution results
        """
        if not self.validate_parameters(parameters, ["code", "language"]):
            return {
                "success": False,
                "error": "Missing required parameters: code and language"
            }
        
        code = parameters["code"]
        language = parameters["language"].lower()
        
        # Validate language
        if language not in self.allowed_languages:
            return {
                "success": False,
                "error": f"Language not allowed: {language}. Allowed: {self.allowed_languages}"
            }
        
        # Security check
        security_check = self._check_code_security(code, language)
        if not security_check["allowed"]:
            return {
                "success": False,
                "error": f"Security violation: {security_check['reason']}",
                "security_check": security_check
            }
        
        try:
            if language == "python":
                return await self._execute_python(code)
            elif language == "javascript":
                return await self._execute_javascript(code)
            elif language == "shell":
                return await self._execute_shell(code)
            else:
                return {
                    "success": False,
                    "error": f"Unsupported language: {language}"
                }
                
        except Exception as e:
            logger.error(f"Code execution failed: {e}")
            return {
                "success": False,
                "error": f"Execution failed: {str(e)}",
                "language": language
            }
    
    async def _execute_python(self, code: str) -> Dict[str, Any]:
        """Execute Python code safely"""
        try:
            # For safety, we'll use a restricted environment
            restricted_globals = {
                '__builtins__': {
                    'print': print,
                    'len': len,
                    'range': range,
                    'str': str,
                    'int': int,
                    'float': float,
                    'list': list,
                    'dict': dict,
                    'set': set,
                    'tuple': tuple,
                    'bool': bool,
                    'type': type,
                    'isinstance': isinstance,
                    'issubclass': issubclass,
                    'hasattr': hasattr,
                    'getattr': getattr,
                    'setattr': setattr,
                    ' ValueError': ValueError,
                    'TypeError': TypeError,
                    'AttributeError': AttributeError,
                }
            }
            
            # Capture stdout
            import io
            import sys
            
            old_stdout = sys.stdout
            captured_output = io.StringIO()
            sys.stdout = captured_output
            
            try:
                # Parse and compile the code first
                parsed = ast.parse(code)
                
                # Check for unsafe operations
                security_check = self._check_python_ast(parsed)
                if not security_check["allowed"]:
                    return {
                        "success": False,
                        "error": f"Python security violation: {security_check['reason']}",
                        "security_check": security_check
                    }
                
                # Execute the code
                exec(compile(parsed, '<string>', 'exec'), restricted_globals)
                
                # Get the output
                output = captured_output.getvalue()
                
                return {
                    "success": True,
                    "language": "python",
                    "output": output,
                    "output_length": len(output)
                }
                
            finally:
                sys.stdout = old_stdout
                captured_output.close()
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Python execution error: {str(e)}",
                "language": "python"
            }
    
    async def _execute_javascript(self, code: str) -> Dict[str, Any]:
        """Execute JavaScript code using Node.js"""
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            try:
                # Execute with Node.js
                result = subprocess.run(
                    ['node', temp_file],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
                
                output = result.stdout
                if result.stderr:
                    output += f"\nErrors:\n{result.stderr}"
                
                # Limit output length
                if len(output) > self.max_output_length:
                    output = output[:self.max_output_length] + "... [output truncated]"
                
                return {
                    "success": result.returncode == 0,
                    "language": "javascript",
                    "output": output,
                    "return_code": result.returncode,
                    "output_length": len(output)
                }
                
            finally:
                # Clean up temporary file
                os.unlink(temp_file)
                
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Execution timed out",
                "language": "javascript",
                "timeout": self.timeout
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"JavaScript execution error: {str(e)}",
                "language": "javascript"
            }
    
    async def _execute_shell(self, code: str) -> Dict[str, Any]:
        """Execute shell commands"""
        try:
            # Security check for shell commands
            if self.sandboxed:
                blocked_commands = ['rm', 'mv', 'dd', 'format', 'mkfs', 'fdisk', 'shutdown', 'reboot']
                for cmd in blocked_commands:
                    if cmd in code.lower():
                        return {
                            "success": False,
                            "error": f"Blocked command: {cmd}",
                            "language": "shell"
                        }
            
            # Execute the command
            result = subprocess.run(
                code,
                shell=True,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            output = result.stdout
            if result.stderr:
                output += f"\nErrors:\n{result.stderr}"
            
            # Limit output length
            if len(output) > self.max_output_length:
                output = output[:self.max_output_length] + "... [output truncated]"
            
            return {
                "success": result.returncode == 0,
                "language": "shell",
                "output": output,
                "return_code": result.returncode,
                "output_length": len(output)
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Execution timed out",
                "language": "shell",
                "timeout": self.timeout
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Shell execution error: {str(e)}",
                "language": "shell"
            }
    
    def _check_code_security(self, code: str, language: str) -> Dict[str, Any]:
        """Check code for security violations"""
        violations = []
        
        # Common dangerous patterns
        dangerous_patterns = [
            'import os', 'import sys', 'import subprocess',
            'open(', 'file(', 'exec(', 'eval(', 'compile(',
            '__import__', 'getattr', 'setattr',
            'rm ', 'del ', 'format ', 'mkfs', 'fdisk'
        ]
        
        for pattern in dangerous_patterns:
            if pattern in code:
                violations.append(f"Contains dangerous pattern: {pattern}")
        
        # Language-specific checks
        if language == "python":
            try:
                parsed = ast.parse(code)
                py_violations = self._check_python_ast(parsed)
                violations.extend(py_violations.get('violations', []))
            except:
                violations.append("Failed to parse Python code")
        
        elif language == "shell" and self.sandboxed:
            # Additional shell-specific checks
            shell_dangerous = ['&', '|', '>', '<', '`', '$(']
            for pattern in shell_dangerous:
                if pattern in code:
                    violations.append(f"Contains shell special character: {pattern}")
        
        if violations:
            return {
                "allowed": False,
                "reason": "Multiple security violations",
                "violations": violations
            }
        else:
            return {"allowed": True}
    
    def _check_python_ast(self, node) -> Dict[str, Any]:
        """Check Python AST for security violations"""
        violations = []
        
        # Recursively check the AST
        for child in ast.walk(node):
            # Check for imports
            if isinstance(child, ast.Import) or isinstance(child, ast.ImportFrom):
                for name in child.names:
                    module_name = name.name
                    if module_name in ['os', 'sys', 'subprocess', 'socket', 'shutil']:
                        violations.append(f"Import of restricted module: {module_name}")
            
            # Check for dangerous function calls
            if isinstance(child, ast.Call):
                if isinstance(child.func, ast.Name):
                    func_name = child.func.id
                    if func_name in ['eval', 'exec', 'compile', 'open', 'input']:
                        violations.append(f"Call to dangerous function: {func_name}")
                
                if isinstance(child.func, ast.Attribute):
                    if (isinstance(child.func.value, ast.Name) and 
                        child.func.value.id in ['os', 'sys', 'subprocess']):
                        violations.append(f"Call to dangerous method: {child.func.attr}")
        
        if violations:
            return {
                "allowed": False,
                "reason": "Python AST security violations",
                "violations": violations
            }
        else:
            return {"allowed": True}
    
    async def cleanup(self) -> None:
        """Clean up resources"""
        await super().cleanup()
        logger.info("Code Executor plugin cleaned up")