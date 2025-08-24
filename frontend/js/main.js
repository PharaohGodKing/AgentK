import { App } from './services/app_manager.js';
import { NotificationService } from './services/notification_service.js';
import { AuthService } from './services/auth.js';
import { ApiClient } from './services/api_client.js';
import { AgentManager } from './components/AgentManager.js';
import { ChatManager } from './components/ChatManager.js';
import { WorkflowBuilder } from './components/WorkflowBuilder.js';
import { ModelManager } from './components/ModelManager.js';
import { Dashboard } from './components/Dashboard.js';
import { SettingsPanel } from './components/SettingsPanel.js';

class AgentKApp {
    constructor() {
        this.app = new App();
        this.notifications = new NotificationService();
        this.auth = new AuthService();
        this.api = new ApiClient();
        
        // Component managers
        this.agentManager = new AgentManager(this.api, this.notifications);
        this.chatManager = new ChatManager(this.api, this.notifications);
        this.workflowBuilder = new WorkflowBuilder(this.api, this.notifications);
        this.modelManager = new ModelManager(this.api, this.notifications);
        this.dashboard = new Dashboard(this.api, this.notifications);
        this.settingsPanel = new SettingsPanel(this.api, this.notifications, this.auth);
        
        this.currentView = null;
        this.views = {
            'dashboard': this.dashboard,
            'agents': this.agentManager,
            'chat': this.chatManager,
            'workflows': this.workflowBuilder,
            'models': this.modelManager,
            'settings': this.settingsPanel
        };
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Show loading screen
            this.showLoading('Initializing Local AI System...');

            // Initialize services
            await this.initializeServices();

            // Load initial data
            await this.loadInitialData();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize components
            await this.initializeComponents();

            // Hide loading screen and show main layout
            this.hideLoading();
            this.showMainLayout();

            // Navigate to default view
            this.app.navigateTo('dashboard');

            // Show welcome notification
            this.notifications.success('System initialized successfully!');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.notifications.error('Failed to initialize application. Please check the console for details.');
            this.showErrorState();
        }
    }

    async initializeServices() {
        // Initialize auth service
        await this.auth.initialize();
        
        // Initialize API client with base URL from config or environment
        const baseUrl = window.env?.API_BASE_URL || 'http://localhost:8000/api';
        this.api.setBaseUrl(baseUrl);
        this.api.setAuthToken(this.auth.getToken());
        
        // Check backend connection
        await this.checkBackendConnection();
    }

    async checkBackendConnection() {
        try {
            this.showLoading('Connecting to backend...');
            const health = await this.api.get('/health');
            
            if (!health.status === 'healthy') {
                throw new Error('Backend is not healthy');
            }
            
            this.notifications.success('Backend connection established');
        } catch (error) {
            console.warn('Backend connection failed:', error);
            this.notifications.warning('Running in offline mode. Some features may be limited.');
            // Set API to offline mode
            this.api.setOfflineMode(true);
        }
    }

    async loadInitialData() {
        this.showLoading('Loading agents and workflows...');
        
        try {
            // Load agents
            const agents = await this.api.get('/agents');
            this.app.setState('agents', agents);
            
            // Load workflows
            const workflows = await this.api.get('/workflows');
            this.app.setState('workflows', workflows);
            
            // Load model connections
            const models = await this.api.get('/models/status');
            this.app.setState('models', models);
            
            // Load user preferences
            const preferences = await this.api.get('/user/preferences');
            this.app.setState('preferences', preferences);
            
        } catch (error) {
            console.warn('Failed to load initial data:', error);
            // Continue with default data
            this.app.setState('agents', []);
            this.app.setState('workflows', []);
            this.app.setState('models', []);
            this.app.setState('preferences', {});
        }
    }

    async initializeComponents() {
        // Initialize all components with current app state
        const appState = this.app.getState();
        
        await this.dashboard.initialize(appState);
        await this.agentManager.initialize(appState);
        await this.chatManager.initialize(appState);
        await this.workflowBuilder.initialize(appState);
        await this.modelManager.initialize(appState);
        await this.settingsPanel.initialize(appState);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                this.app.navigateTo(view);
            });
        });

        // Mobile menu toggle
        document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
            this.app.toggleSidebar();
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            this.app.toggleSidebar();
        });

        // User menu
        document.getElementById('user-menu-btn').addEventListener('click', () => {
            this.app.toggleUserMenu();
        });

        // Global search
        const searchInput = document.getElementById('global-search');
        searchInput.addEventListener('input', (e) => {
            this.app.handleSearch(e.target.value);
        });
        
        // Global search focus shortcut
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.blur();
            }
        });

        // Notifications
        document.getElementById('notifications-btn').addEventListener('click', () => {
            this.app.showNotifications();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', async () => {
            try {
                await this.auth.logout();
                window.location.reload();
            } catch (error) {
                console.error('Logout failed:', error);
                this.notifications.error('Logout failed. Please try again.');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Window focus/blur events
        window.addEventListener('focus', () => {
            this.app.setState('windowFocused', true);
            // Refresh data when window gains focus
            this.refreshData();
        });
        
        window.addEventListener('blur', () => {
            this.app.setState('windowFocused', false);
        });
        
        // Online/offline detection
        window.addEventListener('online', () => {
            this.notifications.success('Connection restored');
            this.api.setOfflineMode(false);
            this.refreshData();
        });
        
        window.addEventListener('offline', () => {
            this.notifications.warning('Connection lost. Running in offline mode.');
            this.api.setOfflineMode(true);
        });
    }

    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            document.getElementById('global-search').focus();
        }

        // Escape to close modals, sidebars, etc.
        if (event.key === 'Escape') {
            this.app.closeModals();
            this.app.closeSidebar();
        }
        
        // Number keys for navigation (1-6)
        if (event.key >= '1' && event.key <= '6' && !event.ctrlKey && !event.metaKey) {
            const views = ['dashboard', 'agents', 'chat', 'workflows', 'models', 'settings'];
            const index = parseInt(event.key) - 1;
            if (index < views.length) {
                event.preventDefault();
                this.app.navigateTo(views[index]);
            }
        }
    }
    
    async refreshData() {
        try {
            // Refresh agents
            const agents = await this.api.get('/agents');
            this.app.setState('agents', agents);
            
            // Refresh models status
            const models = await this.api.get('/models/status');
            this.app.setState('models', models);
            
            // Update components with new data
            this.dashboard.update(this.app.getState());
            this.agentManager.update(this.app.getState());
            this.modelManager.update(this.app.getState());
            
        } catch (error) {
            console.warn('Failed to refresh data:', error);
        }
    }

    showLoading(message = 'Loading...') {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = loadingScreen.querySelector('p');
        
        loadingText.textContent = message;
        loadingScreen.classList.remove('hidden');
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
    }

    showMainLayout() {
        const mainLayout = document.getElementById('main-layout');
        mainLayout.classList.remove('hidden');
    }

    showErrorState() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingContent = loadingScreen.querySelector('.loading-content');
        
        loadingContent.innerHTML = `
            <div class="error-state">
                <h2>Initialization Failed</h2>
                <p>Unable to start the application. Please check:</p>
                <ul>
                    <li>Backend server is running</li>
                    <li>Internet connection is available</li>
                    <li>Browser console for error details</li>
                </ul>
                <button id="retry-button" class="btn btn-primary">Retry</button>
                <button id="offline-button" class="btn btn-secondary">Continue Offline</button>
            </div>
        `;

        document.getElementById('retry-button').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('offline-button').addEventListener('click', () => {
            this.hideLoading();
            this.showMainLayout();
            this.notifications.warning('Running in offline mode. Some features may be limited.');
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set global error handler
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Global error:', message, error);
        // Show user-friendly error notification
        if (window.agentKApp && window.agentKApp.notifications) {
            window.agentKApp.notifications.error('An unexpected error occurred. Please check the console for details.');
        }
    };
    
    // Initialize the app
    window.agentKApp = new AgentKApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentKApp;
}