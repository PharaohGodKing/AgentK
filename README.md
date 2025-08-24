# AgentK Collaborator System

![AgentK](frontend/assets/logo.png)

A completely free, local, no-cloud API, LM Studio-friendly automaton agent platform with GUI.

## 🚀 Features

- **100% Local**: No cloud dependencies, complete privacy
- **LM Studio Integration**: Native support for LM Studio models
- **Ollama Support**: Works with local Ollama models
- **Multi-Agent System**: Manage multiple specialized AI agents
- **Visual Workflows**: Drag-and-drop workflow builder
- **Local Memory**: Vector store for persistent memory
- **Plugin System**: Extensible with custom plugins
- **Beautiful UI**: Modern, responsive dashboard

## 📦 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- LM Studio or Ollama (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/agentk.git
cd agentk

# Run setup script
./scripts/setup.sh

# Or manually
npm run install:dev
```

### Development

```bash
# Start both frontend and backend
npm run dev

# Frontend only (http://localhost:3000)
npm run dev:frontend

# Backend only (http://localhost:8000)
npm run dev:backend
```

### Production

```bash
# Using Docker
npm run docker:build
npm run docker:run

# Manual start
npm start
```

## 🏗️ Architecture

AgentK follows a modular architecture:

```
frontend/          # React-like SPA with vanilla JS
backend/           # FastAPI Python backend
plugins/           # Plugin system for extensibility
data/              # Local data storage
workflows/         # predefined workflows
```

## 🔌 Supported Models

- LM Studio (all local models)
- Ollama (local models)
- Custom model endpoints

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](docs/DEVELOPMENT.md).

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- [Documentation](docs/)
- [FAQ](docs/FAQ.md)
- [Issue Tracker](https://github.com/your-username/agentk/issues)

## 🙏 Acknowledgments

- LM Studio team for amazing local inference
- Ollama team for simple model management
- FastAPI for excellent Python web framework
```

This gives you a complete foundation. Would you like me to continue with:
1. The backend Python files (FastAPI app, models, services)
2. Frontend JavaScript modules
3. Database setup and migrations
4. Plugin system implementation

Let me know which part you'd like me to focus on next!
