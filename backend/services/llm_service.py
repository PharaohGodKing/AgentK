from typing import List, Dict, Optional
import httpx
import aiohttp
import json
from datetime import datetime
from backend.core.config import settings
from backend.models.agent import Agent
from backend.models.chat import ChatMessage, ChatResponse
from uuid import uuid4

class LLMService:
    def __init__(self):
        self.lm_studio_timeout = aiohttp.ClientTimeout(total=settings.LM_STUDIO_TIMEOUT)
        self.ollama_timeout = aiohttp.ClientTimeout(total=settings.OLLAMA_TIMEOUT)

    async def chat_with_agent(self, agent: Agent, message: ChatMessage) -> ChatResponse:
        """Send message to appropriate LLM based on agent configuration"""
        try:
            if "lm-studio" in agent.model:
                response = await self._chat_with_lm_studio(agent, message)
            elif "ollama" in agent.model:
                response = await self._chat_with_ollama(agent, message)
            else:
                response = "I'm configured to use an unsupported model. Please check my configuration."
            
            return ChatResponse(
                agent_id=agent.id,
                content=response,
                usage={"tokens": len(response.split())}  # Simple token count
            )
            
        except Exception as e:
            return ChatResponse(
                agent_id=agent.id,
                content=f"Sorry, I encountered an error: {str(e)}",
                usage={"error": True}
            )

    async def _chat_with_lm_studio(self, agent: Agent, message: ChatMessage) -> str:
        """Chat with LM Studio API"""
        url = f"{settings.LM_STUDIO_BASE_URL}/v1/chat/completions"
        
        payload = {
            "model": agent.model.replace("lm-studio-", ""),
            "messages": [
                {"role": "system", "content": f"You are {agent.name}. {agent.description}"},
                {"role": "user", "content": message.content}
            ],
            "temperature": 0.7,
            "max_tokens": -1,
            "stream": False
        }

        async with aiohttp.ClientSession(timeout=self.lm_studio_timeout) as session:
            async with session.post(url, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    return data['choices'][0]['message']['content']
                else:
                    raise Exception(f"LM Studio API error: {response.status}")

    async def _chat_with_ollama(self, agent: Agent, message: ChatMessage) -> str:
        """Chat with Ollama API"""
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        model_name = agent.model.replace("ollama-", "")
        
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": f"You are {agent.name}. {agent.description}"},
                {"role": "user", "content": message.content}
            ],
            "stream": False
        }

        async with aiohttp.ClientSession(timeout=self.ollama_timeout) as session:
            async with session.post(url, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    return data['message']['content']
                else:
                    raise Exception(f"Ollama API error: {response.status}")

    async def get_available_models(self) -> List[Dict]:
        """Get list of available models from connected services"""
        models = []
        
        # Check LM Studio
        try:
            async with aiohttp.ClientSession(timeout=self.lm_studio_timeout) as session:
                async with session.get(f"{settings.LM_STUDIO_BASE_URL}/v1/models") as response:
                    if response.status == 200:
                        data = await response.json()
                        for model in data.get('data', []):
                            models.append({
                                "id": f"lm-studio-{model['id']}",
                                "name": f"LM Studio - {model['id']}",
                                "type": "lm_studio",
                                "status": "available"
                            })
        except:
            pass

        # Check Ollama
        try:
            async with aiohttp.ClientSession(timeout=self.ollama_timeout) as session:
                async with session.get(f"{settings.OLLAMA_BASE_URL}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        for model in data.get('models', []):
                            models.append({
                                "id": f"ollama-{model['name']}",
                                "name": f"Ollama - {model['name']}",
                                "type": "ollama",
                                "status": "available"
                            })
        except:
            pass

        return models

    async def check_services_status(self) -> Dict:
        """Check status of all LLM services"""
        status = {
            "lm_studio": {"available": False, "url": settings.LM_STUDIO_BASE_URL},
            "ollama": {"available": False, "url": settings.OLLAMA_BASE_URL},
            "timestamp": datetime.utcnow().isoformat()
        }

        # Check LM Studio
        try:
            async with aiohttp.ClientSession(timeout=self.lm_studio_timeout) as session:
                async with session.get(f"{settings.LM_STUDIO_BASE_URL}/v1/models") as response:
                    status["lm_studio"]["available"] = response.status == 200
        except:
            pass

        # Check Ollama
        try:
            async with aiohttp.ClientSession(timeout=self.ollama_timeout) as session:
                async with session.get(f"{settings.OLLAMA_BASE_URL}/api/tags") as response:
                    status["ollama"]["available"] = response.status == 200
        except:
            pass

        return status

    async def get_connected_models_count(self) -> int:
        """Get count of connected models"""
        models = await self.get_available_models()
        return len(models)