import time
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.2f}s"
    )
    
    return response

async def auth_middleware(request: Request, call_next):
    # Basic authentication middleware - can be expanded for API key validation
    # For local use, we might skip authentication or use simple API keys
    
    api_key = request.headers.get("X-API-KEY")