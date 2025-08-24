import { Helpers } from '../utils/helpers.js';

export class AgentsView {
    constructor(agentManager) {
        this.agentManager = agentManager;
        this.container = document.getElementById('content-area');
        this.currentFilter = 'all';
    }

    async show() {
        await this.render();
        this.setupEventListeners();
    }

    hide() {
        this.container.innerHTML = '';
    }

    async render() {
        const agents = this.agentManager.agents;

        this.container.innerHTML = `
            <div class="agents-view">
                <div class="card-header" style="margin-bottom: 2rem;">
                    <h1>Agent Management</h1>
                    <button class="btn btn-primary" id="create-new-agent-btn">+ New Agent</button>
                </div>

                <!-- Filter Tabs -->
                <div class="tabs">
                    <div class="tab ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All Agents</div>
                    <div class="tab ${this.currentFilter === 'online' ? 'active' : ''}" data-filter="online">Online</div>
                    <div class="tab ${this.currentFilter === 'offline' ? 'active' : ''}" data-filter="offline">Offline</div>
                    <div class="tab ${this.currentFilter === 'busy' ? 'active' : ''}" data-filter="busy">Busy</div>
                </div>

                <!-- Agents Grid -->
                <div class="dashboard-grid">
                    ${this.renderAgents(agents)}
                </div>
            </div>
        `;
    }

    renderAgents(agents) {
        let filteredAgents = agents;
        
        if (this.currentFilter !== 'all') {
            filteredAgents = agents.filter(agent => agent.status === this.currentFilter);
        }

        if (filteredAgents.length === 0) {
            return `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <h3>No agents found</h3>
                    <p>${this.currentFilter === 'all' ? 'Create your first agent to get started!' : `No ${this.currentFilter} agents found.`}</p>
                    <button class="btn btn-primary" id="create-first-agent-btn" style="margin-top: 1rem;">
                        Create Your First Agent
                    </button>
                </div>
            `;
        }

        return filteredAgents.map(agent => `
            <div class="card agent-card" data-agent-id="${agent.id}">
                <div class="card-header">
                    <div class="agent-avatar">${agent.avatar || '🤖'}</div>
                    <div class="agent-status ${agent.status}"></div>
                </div>
                <div class="agent-info">
                    <h3 class="agent-name">${agent.name}</h3>
                    <p class="agent-desc">${agent.description || 'No description'}</p>
                    <div class="agent-meta">
                        <span class="agent-model">Model: ${agent.model}</span>
                        <span class="agent-created">Created: ${Helpers.formatDate(agent.created)}</span>
                    </div>
                </div>
                <div class="agent-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-sm chat-btn">Chat</button>
                    <button class="btn btn-secondary btn-sm edit-btn">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Filter tabs
        this.container.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Create agent buttons
        this.container.querySelectorAll('#create-new-agent-btn, #create-first-agent-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('openModal', { detail: 'createAgentModal' }));
            });
        });

        // Agent action buttons
        this.container.querySelectorAll('.chat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const agentCard = e.target.closest('.agent-card');
                const agentId = agentCard.dataset.agentId;
                document.dispatchEvent(new CustomEvent('startChat', { detail: agentId }));
            });
        });

        this.container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const agentCard = e.target.closest('.agent-card');
                const agentId = agentCard.dataset.agentId;
                this.editAgent(agentId);
            });
        });

        this.container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const agentCard = e.target.closest('.agent-card');
                const agentId = agentCard.dataset.agentId;
                this.deleteAgent(agentId);
            });
        });
    }

    async editAgent(agentId) {
        // Would open edit modal
        console.log('Edit agent:', agentId);
    }

    async deleteAgent(agentId) {
        if (confirm('Are you sure you want to delete this agent?')) {
            try {
                await this.agentManager.deleteAgent(agentId);
                this.render();
                document.dispatchEvent(new CustomEvent('showNotification', { 
                    detail: { message: 'Agent deleted successfully', type: 'success' }
                }));
            } catch (error) {
                document.dispatchEvent(new CustomEvent('showNotification', { 
                    detail: { message: 'Failed to delete agent', type: 'error' }
                }));
            }
        }
    }

    search(query) {
        // Implement search functionality for agents
        console.log('Searching agents for:', query);
    }
}
import { Helpers } from '../utils/helpers.js';

export class AgentsView {
    constructor(agentManager) {
        this.agentManager = agentManager;
        this.container = document.getElementById('content-area');
        this.currentFilter = 'all';
    }

    async show() {
        await this.render();
        this.setupEventListeners();
    }

    hide() {
        this.container.innerHTML = '';
    }

    async render() {
        const agents = this.agentManager.agents;

        this.container.innerHTML = `
            <div class="agents-view">
                <div class="card-header" style="margin-bottom: 2rem;">
                    <h1>Agent Management</h1>
                    <button class="btn btn-primary" id="create-new-agent-btn">+ New Agent</button>
                </div>

                <!-- Filter Tabs -->
                <div class="tabs">
                    <div class="tab ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All Agents</div>
                    <div class="tab ${this.currentFilter === 'online' ? 'active' : ''}" data-filter="online">Online</div>
                    <div class="tab ${this.currentFilter === 'offline' ? 'active' : ''}" data-filter="offline">Offline</div>
                    <div class="tab ${this.currentFilter === 'busy' ? 'active' : ''}" data-filter="busy">Busy</div>
                </div>

                <!-- Agents Grid -->
                <div class="dashboard-grid">
                    ${this.renderAgents(agents)}
                </div>
            </div>
        `;
    }

    renderAgents(agents) {
        let filteredAgents = agents;
        
        if (this.currentFilter !== 'all') {
            filteredAgents = agents.filter(agent => agent.status === this.currentFilter);
        }

        if (filteredAgents.length === 0) {
            return `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <h3>No agents found</h3>
                    <p>${this.currentFilter === 'all' ? 'Create your first agent to get started!' : `No ${this.currentFilter} agents found.`}</p>
                    <button class="btn btn-primary" id="create-first-agent-btn" style="margin-top: 1rem;">
                        Create Your First Agent
                    </button>
                </div>
            `;
        }

        return filteredAgents.map(agent => `
            <div class="card agent-card" data-agent-id="${agent.id}">
                <div class="card-header">
                    <div class="agent-avatar">${agent.avatar || '🤖'}</div>
                    <div class="agent-status ${agent.status}"></div>
                </div>
                <div class="agent-info">
                    <h3 class="agent-name">${agent.name}</h3>
                    <p class="agent-desc">${agent.description || 'No description'}</p>
                    <div class="agent-meta">
                        <span class="agent-model">Model: ${agent.model}</span>
                        <span class="agent-created">Created: ${Helpers.formatDate(agent.created)}</span>
                    </div>
                </div>
                <div class="agent-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-sm chat-btn">Chat</button>
                    <button class="btn btn-secondary btn-sm edit-btn">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Filter tabs
        this.container.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Create agent buttons
        this.container.querySelectorAll('#create-new-agent-btn, #create-first-agent-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('openModal', { detail: 'createAgentModal' }));
            });
        });

        // Agent action buttons
        this.container.querySelectorAll('.chat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const agentCard = e.target.closest('.agent-card');
                const agentId = agentCard.dataset.agentId;
                document.dispatchEvent(new CustomEvent('startChat', { detail: agentId }));
            });
        });

        this.container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const agentCard = e.target.closest('.agent-card');
                const agentId = agentCard.dataset.agentId;
                this.editAgent(agentId);
            });
        });

        this.container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const agentCard = e.target.closest('.agent-card');
                const agentId = agentCard.dataset.agentId;
                this.deleteAgent(agentId);
            });
        });
    }

    async editAgent(agentId) {
        // Would open edit modal
        console.log('Edit agent:', agentId);
    }

    async deleteAgent(agentId) {
        if (confirm('Are you sure you want to delete this agent?')) {
            try {
                await this.agentManager.deleteAgent(agentId);
                this.render();
                document.dispatchEvent(new CustomEvent('showNotification', { 
                    detail: { message: 'Agent deleted successfully', type: 'success' }
                }));
            } catch (error) {
                document.dispatchEvent(new CustomEvent('showNotification', { 
                    detail: { message: 'Failed to delete agent', type: 'error' }
                }));
            }
        }
    }

    search(query) {
        // Implement search functionality for agents
        console.log('Searching agents for:', query);
    }
}