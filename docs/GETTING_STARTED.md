 Getting Started with AgentK

Welcome to AgentK! This guide will help you set up and start using your local AI automation platform.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Python 3.8+** installed
- **Node.js 16+** installed
- **LM Studio** or **Ollama** (optional, for local models)
- 4GB+ RAM recommended

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agentk.git
   cd agentk

    Run the setup script
    bash

# On Linux/Mac
./scripts/setup.sh

# On Windows
scripts/setup.bat

Start the application
bash

    npm run dev

    Open your browser
    Navigate to http://localhost:3000

First Run Configuration

    Configure LM Studio (Recommended):

        Download and install LM Studio

        Start LM Studio and load your preferred model

        AgentK will automatically detect running instances

    Or configure Ollama:

        Install Ollama

        Pull a model: ollama pull llama2

        AgentK will connect automatically

    Basic Settings:

        Open Settings → General

        Set your preferred default model

        Configure auto-save preferences

🎯 Your First Agent
Create a Research Assistant

    Click "+ New Agent" in the top right

    Fill in the details:

        Name: Research Assistant

        Description: Helps with web research and analysis

        Model: Select your preferred model

        Capabilities: Enable "Web Research" and "Data Analysis"

    Test your agent:

        Click the "Test" button

        Send a sample query: "Research recent AI advancements"

        Verify the response looks good

Start a Conversation

    Go to the Chat section

    Select your Research Assistant

    Ask questions like:

        "What are the latest developments in quantum computing?"

        "Find recent papers about transformer architectures"

📁 Project Structure
text

agentk/
├── frontend/          # Web interface
├── backend/           # Python API server
├── plugins/           # Custom extensions
├── data/             # Local storage
└── docs/             # Documentation

🔧 Basic Configuration
Environment Variables

Create a .env file for custom configuration:
env

# Server Configuration
PORT=8000
HOST=0.0.0.0

# Model Settings
LM_STUDIO_BASE_URL=http://localhost:1234
OLLAMA_BASE_URL=http://localhost:11434

# Optional: External Services
QDRANT_URL=http://localhost:6333
REDIS_URL=redis://localhost:6379

File Locations

    Database: data/agentk.db

    Logs: data/logs/app.log

    Configurations: frontend/config/

    Uploads: data/uploads/

🆘 Need Help?

    Check the FAQ for common questions

    Visit Troubleshooting for solutions

    Join our Discord community

    Create an issue on GitHub

🎉 Next Steps

    Explore Workflows for automation

    Learn about Agents in depth

    Check out API documentation for developers

    Read about Deployment for production setups

Welcome to the AgentK community! 🚀