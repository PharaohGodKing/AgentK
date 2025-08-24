Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Installation Problems

#### ❌ "Command not found" errors
**Problem**: Setup scripts fail to run
**Solution**:
```bash
# Make scripts executable
chmod +x scripts/setup.sh
chmod +x scripts/start.sh

# Or run with explicit interpreter
bash scripts/setup.sh

❌ Python package installation fails

Problem: pip can't install dependencies
Solution:
bash

# Upgrade pip first
python -m pip install --upgrade pip

# Clear pip cache
pip cache purge

# Try with --no-cache-dir
pip install --no-cache-dir -r requirements.txt

❌ Node.js dependencies fail

Problem: npm install errors
Solution:
bash

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

Model Connection Issues
❌ "Cannot connect to LM Studio"

Problem: AgentK can't reach LM Studio
Solution:

    Verify LM Studio is running

    Check the base URL (default: http://localhost:1234)

    Ensure the model is loaded in LM Studio

    Check firewall settings

❌ "Ollama connection failed"

Problem: Can't connect to Ollama
Solution:
bash

# Start Ollama service
ollama serve

# Check if Ollama is running
curl http://localhost:11434/api/tags

# Pull the model again if needed
ollama pull llama2

❌ "No models available"

Problem: No models detected
Solution:

    Check if your model server is running

    Verify the API endpoint in settings

    Ensure models are properly loaded

    Check network connectivity

Performance Issues
❌ Slow response times

Problem: Agents respond slowly
Solution:

    Reduce model context window

    Enable response streaming

    Close other resource-intensive applications

    Allocate more RAM to model server

❌ High memory usage

Problem: System becomes sluggish
Solution:
yaml

# In config.yaml
memory:
  max_history: 25  # Reduce chat history
  cache_size: 100  # Reduce cache size

❌ Model loading failures

Problem: Models fail to load or crash
Solution:

    Use smaller models for your hardware

    Allocate more RAM to the model server

    Check model file integrity

    Try different model quantization

Database Issues
❌ Database corruption

Problem: "Database disk image is malformed"
Solution:
bash

# Backup first
cp data/agentk.db data/agentk.db.backup

# Try to repair
sqlite3 data/agentk.db ".dump" | sqlite3 data/agentk.fixed.db
mv data/agentk.fixed.db data/agentk.db

❌ Database locked

Problem: "Database is locked" errors
Solution:

    Close other applications using the database

    Restart AgentK

    Check for zombie processes: ps aux | grep sqlite

Network Issues
❌ CORS errors

Problem: Browser CORS policy violations
Solution:
yaml

# In backend config
cors:
  origins: ["http://localhost:3000", "http://127.0.0.1:3000"]
  allow_credentials: true

❌ WebSocket connection failures

Problem: WebSocket connections drop
Solution:

    Check firewall settings

    Verify network stability

    Increase timeout settings

🔧 Advanced Troubleshooting
Log Files Location
bash

# Main application logs
data/logs/app.log

# Backend server logs  
data/logs/server.log

# Frontend logs (browser console)
# Press F12 in browser

Enabling Debug Logging
yaml

# In config.yaml
logging:
  level: "DEBUG"
  file: "data/logs/debug.log"
  max_size: "10MB"
  backup_count: 5

Checking System Resources
bash

# Check memory usage
free -h

# Check disk space
df -h

# Check running processes
top

Network Diagnostics
bash

# Check if ports are open
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# Test connectivity
curl http://localhost:8000/health
curl http://localhost:1234/v1/models

🐛 Common Error Messages
"ModuleNotFoundError: No module named '...'"

Solution:
bash

# Reinstall requirements
pip install -r requirements.txt

# Check Python path
python -c "import sys; print(sys.path)"

"Address already in use"

Solution:
bash

# Find the process using the port
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=8001 npm run dev

"SSL certificate verify failed"

Solution:
bash

# For development, disable SSL verification (not recommended for production)
export SSL_VERIFY=false

"Out of memory"

Solution:

    Reduce model size

    Close other applications

    Add swap space

    Upgrade system RAM

🔄 Reset and Recovery
Reset Application Data
bash

# WARNING: This will delete all your data!
./scripts/reset.sh

# Or manually
rm -rf data/agentk.db data/uploads/ data/vector_store/

Backup and Restore
bash

# Create backup
tar -czf backup.tar.gz data/

# Restore from backup
tar -xzf backup.tar.gz

Reinstall from Scratch
bash

# Complete clean reinstall
./scripts/uninstall.sh
git clean -fdx
./scripts/setup.sh

📊 Performance Tuning
For Low-RAM Systems (8GB or less)
yaml

model:
  context_window: 2048
  max_tokens: 1024

memory:
  max_history: 10
  cache_enabled: false

For Medium Systems (16GB)
yaml

model:
  context_window: 4096
  max_tokens: 2048

memory:
  max_history: 20
  cache_enabled: true

For High-Performance Systems (32GB+)
yaml

model:
  context_window: 8192
  max_tokens: 4096

memory:
  max_history: 50
  cache_enabled: true
  cache_size: 1000

🆘 Getting Help
Before Asking for Help

    Check the logs: tail -f data/logs/app.log

    Restart the application

    Check system resources

    Verify network connectivity

Information to Provide

When seeking help, include:

    AgentK version

    Operating system

    Hardware specifications

    Error messages from logs

    Steps to reproduce the issue

Community Support

    GitHub Issues: https://github.com/your-username/agentk/issues

    Discord: https://discord.gg/your-community

    Documentation: https://github.com/your-username/agentk/docs

🎯 Quick Fixes Cheat Sheet
Problem	Quick Fix
Can't connect to model	Restart model server
Slow performance	Reduce context window
High memory usage	Close other apps, use smaller model
Database errors	Restart application
Installation fails	Check dependencies, clear caches