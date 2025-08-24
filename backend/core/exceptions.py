from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

class AgentKException(Exception):
    def __init__(self, message: str, code: int = 400):
        self.message = message
        self.code = code

async def agentk_exception_handler(request: Request, exc: AgentKException):
    return JSONResponse(
        status_code=exc.code,
        content={"detail": exc.message, "error": True},
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error": True},
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error", 
            "errors": exc.errors(),
            "error": True
        },
    )

def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(AgentKException, agentk_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)