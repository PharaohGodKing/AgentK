API Documentation

**📄 docs/API.md**
```markdown
# AgentK API Reference

## 📋 Overview

AgentK provides a comprehensive REST API for managing AI agents, workflows, and conversations.

### Base URL

http://localhost:8000/api/v1
text


### Authentication
```http
Authorization: Bearer <token>

🔑 Quick Start
1. Check API Health
http

GET /health

2. List Available Agents
http

GET /agents

3. Send a Message
http

POST /chat/{agent_id}
Content-Type: application/json

{
  "message": "Hello, agent!"
}

🧠 Agents API
List Agents
http

GET /agents

Response:
json

{
  "agents": [
    {
      "id": "uuid",
      "name": "Research Assistant",
      "description": "Helps with research tasks",
      "model": "lmstudio-mistral",
      "status": "online",
      "capabilities": ["web_research", "data_analysis"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}

Get Agent Details
http

GET /agents/{agent_id}

Create Agent
http

POST /agents
Content-Type: application/json

{
  "name": "New Agent",
  "description": "Agent description",
  "model": "lmstudio-mistral",
  "capabilities": ["web_research"],
  "avatar": "🤖"
}

Update Agent
http

PUT /agents/{agent_id}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "offline"
}

Delete Agent
http

DELETE /agents/{agent_id}

💬 Chat API
Send Message
http

POST /chat/{agent_id}
Content-Type: application/json

{
  "message": "Your message here",
  "stream": false
}

Response:
json

{
  "response": "Agent response here",
  "usage": {
    "tokens": 150,
    "time_ms": 1250
  },
  "timestamp": "2024-01-01T00:00:00Z"
}

Stream Message
http

POST /chat/{agent_id}
Content-Type: application/json

{
  "message": "Your message here",
  "stream": true
}

Response: Server-Sent Events stream
Get Chat History
http

GET /chat/{agent_id}/history?limit=50

⚙️ Models API
List Available Models
http

GET /models

Response:
json

{
  "models": [
    {
      "id": "lmstudio-mistral",
      "name": "Mistral 7B",
      "type": "lm_studio",
      "status": "available",
      "capabilities": ["chat", "completion"]
    }
  ]
}

Check Model Status
http

GET /models/status

🔄 Workflows API
List Workflows
http

GET /workflows

Create Workflow
http

POST /workflows
Content-Type: application/json

{
  "name": "Research Workflow",
  "description": "Automated research pipeline",
  "nodes": [...],
  "connections": [...]
}

Execute Workflow
http

POST /workflows/{workflow_id}/execute
Content-Type: application/json

{
  "input": "Research topic",
  "parameters": {}
}

📊 System API
System Status
http

GET /system/status

Response:
json

{
  "status": "operational",
  "agents": 5,
  "models_connected": 2,
  "memory_usage": "45%",
  "uptime": "2h 30m"
}

Health Check
http

GET /health

Metrics
http

GET /system/metrics

🗄️ Memory API
Store Memory
http

POST /memory
Content-Type: application/json

{
  "agent_id": "uuid",
  "content": "Important information",
  "tags": ["research", "important"]
}

Query Memory
http

GET /memory?query=search+term&limit=10

Delete Memory
http

DELETE /memory/{memory_id}

🧩 Plugins API
List Plugins
http

GET /plugins

Execute Plugin
http

POST /plugins/{plugin_id}/execute
Content-Type: application/json

{
  "parameters": {
    "query": "search term"
  }
}

📁 Files API
Upload File
http

POST /files/upload
Content-Type: multipart/form-data

# Form data: file=@document.pdf

List Files
http

GET /files

Download File
http

GET /files/{file_id}/download

⚠️ Error Responses
Common Error Codes
http

400 Bad Request - Invalid input
401 Unauthorized - Authentication required
404 Not Found - Resource not found
500 Internal Server Error - Server error

Error Response Format
json

{
  "error": {
    "code": "invalid_input",
    "message": "Invalid input provided",
    "details": {
      "field": "name",
      "issue": "required field missing"
    }
  }
}

🔐 Authentication API
Get API Token
http

POST /auth/token
Content-Type: application/json

{
  "username": "user",
  "password": "pass"
}

Response:
json

{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "expires_in": 3600
}

Refresh Token
http

POST /auth/refresh
Authorization: Bearer <token>

🧪 Testing Endpoints
Echo Test
http

GET /test/echo?message=Hello

Mock Response
http

POST /test/mock
Content-Type: application/json

{
  "response": "Mock response",
  "delay_ms": 1000
}

📈 Rate Limits

    Default: 100 requests per minute

    Burst: 150 requests allowed

    Per IP: Limits applied per IP address

🔄 WebSocket API
Connect to WebSocket
javascript

const ws = new WebSocket('ws://localhost:8000/ws');

Send Message
javascript

ws.send(JSON.stringify({
  type: 'chat_message',
  agent_id: 'uuid',
  message: 'Hello'
}));

Receive Messages
javascript

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

📊 Response Formats
JSON Response

All API endpoints return JSON responses with consistent formatting:
json

{
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}

Pagination

Endpoints supporting pagination include:
json

{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}

