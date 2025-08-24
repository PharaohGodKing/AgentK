from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from plugins.plugin_manager import plugin_manager

# Initialize the FastAPI app
app = FastAPI()

# Configure CORS to allow your HTML file to communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# This is a placeholder for actual agent data.
# Eventually, this will come from your agent management logic.
mock_agent_db = [
    {
        "id": "researcher_01",
        "name": "Research Assistant",
        "description": "Web research and analysis",
        "status": "online"
    },
    {
        "id": "coder_01",
        "name": "Coding Assistant",
        "description": "Code generation and review",
        "status": "busy"
    },
    {
        "id": "writer_01",
        "name": "Writing Assistant",
        "description": "Content creation",
        "status": "online"
    }
]

@app.get("/api/agents")
async def get_active_agents():
    """
    This endpoint provides the list of active agents.
    """
    return {"agents": mock_agent_db}

# To run this server, save the file as main.py and run the following
# command in your terminal: uvicorn main:app --reload
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database and services
    await init_db()
    app.state.db = get_db()
    
    # Initialize plugin manager
    app.state.plugin_manager = await get_plugin_manager()
    
    # Create necessary directories
    Path(settings.UPLOAD_PATH).mkdir(parents=True, exist_ok=True)
    Path(settings.LOG_PATH).mkdir(parents=True, exist_ok=True)
    
    print(f"🚀 {settings.APP_NAME} starting in {settings.APP_ENV} mode")
    yield
    
    # Shutdown: Clean up resources
    if hasattr(app.state, 'plugin_manager'):
        await app.state.plugin_manager.cleanup()
    print("🛑 Shutting down AgentK")