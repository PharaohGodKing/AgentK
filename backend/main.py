from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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