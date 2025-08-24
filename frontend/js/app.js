import { DashboardView } from './components/Dashboard.js';
import { AgentsView } from './components/Agents.js';
import { ChatView } from './components/Chat.js';
import { WorkflowsView } from './components/Workflows.js';
import { SettingsView } from './components/Settings.js';
import { ModalManager } from './components/Modal.js';
import { ApiClient } from './services/api_client.js';
import { AgentManager } from './services/agent_manager.js';

export class App {
    constructor() {
        this.currentView = 'dashboard';
        this.apiClient = new ApiClient();
        this.agentManager = new AgentManager(this.apiClient);
        this.modalManager = new ModalManager();
        this.views = {
            dashboard: new DashboardView(this.agentManager),
            agents: new AgentsView(this.agentManager),
            chat: new ChatView(this.agentManager),
            workflows: new WorkflowsView(),
            settings: new SettingsView()
        };
    }

    async init() {
        this.setupEventListeners();
        this.setupNavigation();
        await this.loadInitialData();
        this.showView('dashboard');
    }

    setupEventListeners() {
        // Navigation clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const viewName = e.currentTarget.dataset.view;
                this.showView(viewName);
            });
        });

        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        searchInput.focus();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.modalManager.openModal('createAgentModal');
                        break;
                }
            }
        });
    }

    setupNavigation() {
        // Set active navigation item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    async loadInitialData() {
        try {
            await this.agentManager.loadAgents();
            await this.agentManager.loadModels();
            this.updateStatusIndicators();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Failed to load data. Please check your connection.', 'error');
        }
    }

    showView(viewName) {
        // Hide all views
        Object.values(this.views).forEach(view => view.hide());
        
        // Show selected view
        if (this.views[viewName]) {
            this.views[viewName].show();
            this.currentView = viewName;
        }
    }

    handleSearch(query) {
        // Delegate search to current view
        if (this.views[this.currentView] && this.views[this.currentView].search) {
            this.views[this.currentView].search(query);
        }
    }

    updateStatusIndicators() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-indicator span');
        
        if (this.agentManager.connected) {
            statusDot.style.backgroundColor = 'var(--secondary)';
            statusText.textContent = 'LM Studio: Connected';
        } else {
            statusDot.style.backgroundColor = 'var(--danger)';
            statusText.textContent = 'LM Studio: Disconnected';
        }
    }

    showNotification(message, type = 'info') {
        // Would be implemented with a notification service
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}
