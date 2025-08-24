export default class Dashboard {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'dashboard-view';
    }

    async render() {
        this.element.innerHTML = `
            <div class="dashboard-header">
                <h1>AgentK Dashboard</h1>
                <p>Local AI Collaborator System</p>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-title">Active Agents</div>
                    <div class="metric-value" id="active-agents-count">0</div>
                    <div class="metric-change positive">+0 today</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Tasks Completed</div>
                    <div class="metric-value" id="tasks-completed">0</div>
                    <div class="metric-change positive">+0 today</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Model Performance</div>
                    <div class="metric-value" id="model-performance">0%</div>
                    <div class="metric-change positive">+0% today</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Local Resources</div>
                    <div class="metric-value" id="local-resources">0%</div>
                    <div class="metric-change negative">-0% today</div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Active Agents</h3>
                        <button class="btn btn-secondary">View All</button>
                    </div>
                    <div class="card-content" id="active-agents-list">
                        <div class="loading">Loading agents...</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Tasks</h3>
                        <button class="btn btn-secondary">View All</button>
                    </div>
                    <div class="card-content" id="recent-tasks-list">
                        <div class="loading">Loading tasks...</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Model Connections</h3>
                        <button class="btn btn-secondary">Manage</button>
                    </div>
                    <div class="card-content" id="model-connections-list">
                        <div class="loading">Loading models...</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div class="card-content">
                        <button class="btn btn-primary full-width" id="create-agent-btn">
                            Create New Agent
                        </button>
                        <button class="btn btn-secondary full-width" id="design-workflow-btn">
                            Design Workflow
                        </button>
                        <button class="btn btn-secondary full-width" id="start-chat-btn">
                            Start Conversation
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Load data
        await this.loadData();

        // Set up event listeners
        this.setupEventListeners();

        return this.element;
    }

    async loadData() {
        try {
            // Load agents
            const agents = await window.app.getState('agents') || [];
            this.renderAgents(agents);
            
            // Load models
            const models = await window.app.getState('models') || [];
            this.renderModels(models);
            
            // Update metrics
            this.updateMetrics(agents, models);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    renderAgents(agents) {
        const container = this.element.querySelector('#active-agents-list');
        
        if (agents.length === 0) {
            container.innerHTML = '<div class="empty-state">No agents available</div>';
            return;
        }

        const activeAgents = agents.slice(0, 3); // Show first 3 agents
        
        container.innerHTML = activeAgents.map(agent => `
            <div class="agent-item">
                <div class="agent-avatar">${agent.name.charAt(0)}</div>
                <div class="agent-info">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-desc">${agent.description || 'No description'}</div>
                </div>
                <div class="agent-status ${agent.status || 'offline'}"></div>
            </div>
        `).join('');
    }

    renderModels(models) {
        const container = this.element.querySelector('#model-connections-list');
        
        if (models.length === 0) {
            container.innerHTML = '<div class="empty-state">No models connected</div>';
            return;
        }

        container.innerHTML = models.map(model => `
            <div class="model-item">
                <div class="model-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-desc">${model.status || 'Unknown status'}</div>
                </div>
                <div class="model-status ${model.connected ? 'online' : 'offline'}"></div>
            </div>
        `).join('');
    }

    updateMetrics(agents, models) {
        // Update active agents count
        const activeAgents = agents.filter(a => a.status === 'online').length;
        this.element.querySelector('#active-agents-count').textContent = activeAgents;
        
        // Update model performance (simulated)
        const performance = models.length > 0 ? '92%' : '0%';
        this.element.querySelector('#model-performance').textContent = performance;
        
        // Update other metrics (simulated)
        this.element.querySelector('#tasks-completed').textContent = '142';
        this.element.querySelector('#local-resources').textContent = '64%';
    }

    setupEventListeners() {
        // Create agent button
        this.element.querySelector('#create-agent-btn').addEventListener('click', () => {
            window.app.navigateTo('agents');
        });

        // Design workflow button
        this.element.querySelector('#design-workflow-btn').addEventListener('click', () => {
            window.app.navigateTo('workflows');
        });

        // Start chat button
        this.element.querySelector('#start-chat-btn').addEventListener('click', () => {
            window.app.navigateTo('chat');
        });
    }
}