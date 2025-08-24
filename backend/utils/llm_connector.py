from typing import Dict, Any, List, Optional
import aiohttp
import json
from backend.core.config import settings

async def connect_to_llm(model_type: str, model_config: Dict[str, Any]) -> bool:
    """Test connection to an LLM service"""
    try:
        if model_type == "lmstudio":
            url = model_config.get("url", settings.LM_STUDIO_URL)
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{url}/v1/models", timeout=5) as response:
                    return response.status == 200
        elif model_type == "ollama":
            url = model_config.get("url", settings.OLLAMA_URL)
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{url}/api/tags", timeout=5) as response:
                    return response.status == 200
        else:
            return False
    except:
        return False

async def generate_response(
    model_type: str, 
    model_name: str, 
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = -1
) -> str:
    """Generate a response using the specified LLM"""
    try:
        if model_type == "lmstudio":
            url = settings.LM_STUDIO_URL
            payload = {
                "model": model_name,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{url}/v1/chat/completions", json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        return f"Error: LM Studio API returned status {response.status}"
        
        elif model_type == "ollama":
            url = settings.OLLAMA_URL
            payload = {
                "model": model_name,
                "messages": messages,
                "stream": False
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{url}/api/chat", json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["message"]["content"]
                    else:
                        return f"Error: Ollama API returned status {response.status}"
        
        else:
            return "Error: Unsupported model type"
    
    except Exception as e:
        return f"Error generating response: {str(e)}"