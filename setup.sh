#!/bin/bash

# AgentK Setup Script
echo "🚀 Starting AgentK installation..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p frontend/{css,js/{utils,components,services},assets/{icons,avatars,sounds},config}
mkdir -p backend/{core,api/endpoints,models,services,db/{migrations,adapters},utils,tests/{unit,integration,fixtures},scripts}
mkdir -p plugins/{core_plugins,custom_plugins}
mkdir -p data/{databases/{sqlite,surreal},memory/{chroma,qdrant},uploads/{documents,images,exports},logs,cache/{llm,sessions,temp}}
mkdir -p docs/images
mkdir -p tests/{frontend/{unit,integration,e2e},backend/{unit,integration,e2e},performance,fixtures}
mkdir -p scripts

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create default configuration files
echo "⚙️  Creating default configuration..."

# Frontend config
cat > frontend/config/agents.json << 'EOF'
[
  {
    "id": "research-assistant",
    "name": "Research Assistant",
    "description": "Web research and analysis specialist",
    "avatar": "RA",
    "status": "online",
    "model": "lm-studio-mistral",
    "capabilities": ["web_research", "data_analysis", "summarization"],
    "created": "2024-01-01T00:00:00Z"
  },
  {
    "id": "coding-assistant",
    "name": "Coding Assistant",
    "description": "Code generation and review expert",
    "avatar": "CA",
    "status": "busy",
    "model": "ollama-codellama",
    "capabilities": ["code_generation", "code_review", "debugging"],
    "created": "2024-01-01T00:00:00Z"
  }
]
EOF

cat > frontend/config/models.json << 'EOF'
[
  {
    "id": "lm-studio-mistral",
    "name": "LM Studio - Mistral 7B",
    "type": "lm_studio",
    "base_url": "http://localhost:1234",
    "enabled": true,
    "default": true
  },
  {
    "id": "ollama-codellama",
    "name": "Ollama - CodeLlama",
    "type": "ollama",
    "base_url": "http://localhost:11434",
    "enabled": true,
    "default": false
  }
]
EOF

cat > frontend/config/workflows.json << 'EOF'
[
  {
    "id": "research-workflow",
    "name": "Research Workflow",
    "description": "Automated research and analysis pipeline",
    "steps": ["web_search", "summarize", "analyze"],
    "agents": ["research-assistant"],
    "enabled": true
  }
]
EOF

cat > frontend/config/settings.json << 'EOF'
{
  "theme": "dark",
  "language": "en",
  "auto_save": true,
  "notifications": true,
  "max_history": 100,
  "default_model": "lm-studio-mistral"
}
EOF

# Create environment file from example
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Set up permissions
chmod +x scripts/*.sh

echo "✅ AgentK installation complete!"
echo "📖 Next steps:"
echo "   1. Edit .env file with your settings"
echo "   2. Run 'npm run dev' to start development servers"
echo "   3. Open http://localhost:3000 in your browser"