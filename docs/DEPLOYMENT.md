Deployment Guide

**📄 docs/DEPLOYMENT.md**
```markdown
# Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Python 3.8+
- Node.js 16+
- 8GB+ RAM (16GB+ recommended)
- 20GB+ storage

### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip python3-venv nodejs npm redis-server nginx

# Create dedicated user
sudo useradd -m -s /bin/bash agentk
sudo passwd agentk

Installation
bash

# Switch to agentk user
sudo su - agentk

# Clone repository
git clone https://github.com/your-username/agentk.git
cd agentk

# Run setup
./scripts/setup.sh

# Build frontend for production
cd frontend
npm run build

⚙️ Configuration
Environment Variables
bash

# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
API_URL=http://localhost:8000
LM_STUDIO_BASE_URL=http://localhost:1234
OLLAMA_BASE_URL=http://localhost:11434
REDIS_URL=redis://localhost:6379
DATABASE_URL=sqlite:///home/agentk/agentk/data/agentk.db
EOF

Systemd Service Files
bash

# Create backend service
sudo tee /etc/systemd/system/agentk-backend.service << EOF
[Unit]
Description=AgentK Backend Service
After=network.target

[Service]
User=agentk
Group=agentk
WorkingDirectory=/home/agentk/agentk
EnvironmentFile=/home/agentk/agentk/.env.production
ExecStart=/home/agentk/agentk/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

bash

# Create frontend service (if not using nginx)
sudo tee /etc/systemd/system/agentk-frontend.service << EOF
[Unit]
Description=AgentK Frontend Service
After=network.target

[Service]
User=agentk
Group=agentk
WorkingDirectory=/home/agentk/agentk/frontend
EnvironmentFile=/home/agentk/agentk/.env.production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

Nginx Configuration
bash

sudo tee /etc/nginx/sites-available/agentk << EOF
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/agentk/agentk/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/agentk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

🔒 Security Setup
SSL Certificate (Let's Encrypt)
bash

# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet

Firewall Configuration
bash

# Enable firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22

File Permissions
bash

# Set proper permissions
sudo chown -R agentk:agentk /home/agentk/agentk
sudo chmod 755 /home/agentk
sudo chmod 600 /home/agentk/agentk/.env.production

📦 Docker Deployment
Docker Compose Setup
yaml

# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///app/data/agentk.db
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/app/data
    depends_on:
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://localhost:8000

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html

Docker Build
bash

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

🎯 Kubernetes Deployment
Basic Deployment
yaml

# agentk-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agentk-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: agentk-backend
  template:
    metadata:
      labels:
        app: agentk-backend
    spec:
      containers:
      - name: backend
        image: your-registry/agentk-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "sqlite:///app/data/agentk.db"
---
apiVersion: v1
kind: Service
metadata:
  name: agentk-backend-service
spec:
  selector:
    app: agentk-backend
  ports:
  - port: 8000
    targetPort: 8000

📊 Monitoring and Logging
Prometheus Metrics
yaml

# Enable metrics endpoint
monitoring:
  enabled: true
  port: 9090
  metrics:
    - response_time
    - memory_usage
    - request_count

Log Management
bash

# View logs
journalctl -u agentk-backend -f

# Log rotation
sudo tee /etc/logrotate.d/agentk << EOF
/home/agentk/agentk/data/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    copytruncate
}
EOF

🔄 Backup Strategy
Automated Backups
bash

# Create backup script
cat > /home/agentk/backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
tar -czf /backups/agentk_\$DATE.tar.gz /home/agentk/agentk/data
find /backups -name "agentk_*.tar.gz" -mtime +7 -delete
EOF

# Make executable and schedule
chmod +x /home/agentk/backup.sh
sudo crontab -e
# Add: 0 2 * * * /home/agentk/backup.sh

Database Backup
bash

# SQLite backup
sqlite3 data/agentk.db ".backup data/agentk.db.backup"

# Regular backup script
cat > /home/agentk/db_backup.sh << EOF
#!/bin/bash
sqlite3 /home/agentk/agentk/data/agentk.db ".backup /backups/agentk.db.\$(date +%Y%m%d).backup"
find /backups -name "agentk.db.*.backup" -mtime +30 -delete
EOF

📈 Scaling Strategies
Vertical Scaling

    Increase server RAM (16GB → 32GB+)

    Use faster storage (SSD/NVMe)

    Upgrade CPU for better performance

Horizontal Scaling
yaml

# Load balancer configuration
load_balancing:
  strategy: "round_robin"
  health_check: "/health"
  timeout: 30

Database Scaling

    Migrate to PostgreSQL for larger deployments

    Implement database connection pooling

    Add read replicas for heavy read workloads

🚀 Performance Optimization
Production Tuning
yaml

# backend/config/production.yaml
performance:
  worker_count: 4
  max_connections: 1000
  timeout: 30
  keepalive: 5

caching:
  enabled: true
  ttl: 300
  max_size: 1000

CDN Configuration
nginx

# Nginx with CDN
location /static {
    proxy_pass http://localhost:3000;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

🔧 Maintenance
Regular Updates
bash

# Update application
sudo su - agentk
cd agentk
git pull
./scripts/setup.sh
sudo systemctl restart agentk-backend

# Update system packages
sudo apt update && sudo apt upgrade -y

Health Checks
bash

# Create health check script
cat > /home/agentk/healthcheck.sh << EOF
#!/bin/bash
curl -f http://localhost:8000/health || exit 1
curl -f http://localhost:3000 || exit 1
EOF

Monitoring Setup
bash

# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up alerting
# Consider tools like:
# - Prometheus + Grafana
# - Datadog
# - New Relic

🆘 Disaster Recovery
Recovery Plan

    Identify failure: Check logs and monitoring

    Restore services: Restart failed components

    Data recovery: Restore from backups

    Root cause analysis: Investigate and fix

Backup Verification
bash

# Test backup restoration
tar -xzf backup.tar.gz -C /tmp/test-restore
sqlite3 /tmp/test-restore/data/agentk.db "SELECT COUNT(*) FROM agents"

📋 Deployment Checklist

    Server provisioned and updated

    Dependencies installed

    Application deployed

    SSL certificate configured

    Firewall configured

    Backup system in place

    Monitoring configured

    Health checks passing

    Documentation updated