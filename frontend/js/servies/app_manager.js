export class App {
    constructor() {
        this.state = {
            agents: [],
            workflows: [],
            models: [],
            preferences: {},
            currentView: 'dashboard',
            sidebarOpen: true,
            searchQuery: '',
            windowFocused: true
        };
        
        this.eventListeners = {};
    }
    
    getState() {
        return this.state;
    }
    
    setState(key, value) {
        this.state[key] = value;
        this.emit('stateChange', { key, value });
    }
    
    navigateTo(view) {
        if (this.state.views && this.state.views[view]) {
            this.setState('currentView', view);
            this.emit('navigate', view);
        } else {
            console.error(`View ${view} not found`);
        }
    }
    
    toggleSidebar() {
        this.setState('sidebarOpen', !this.state.sidebarOpen);
    }
    
    closeSidebar() {
        this.setState('sidebarOpen', false);
    }
    
    toggleUserMenu() {
        this.emit('toggleUserMenu');
    }
    
    handleSearch(query) {
        this.setState('searchQuery', query);
        this.emit('search', query);
    }
    
    showNotifications() {
        this.emit('showNotifications');
    }
    
    closeModals() {
        this.emit('closeModals');
    }
    
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
}