import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants.js';

// Local storage wrapper with fallbacks
class StorageManager {
    constructor() {
        this.isAvailable = this.checkAvailability();
    }

    checkAvailability() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('Local storage is not available:', e);
            return false;
        }
    }

    get(key, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;
        
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading from localStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    set(key, value) {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Error writing to localStorage key "${key}":`, error);
            return false;
        }
    }

    remove(key) {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Error removing from localStorage key "${key}":`, error);
            return false;
        }
    }

    clear() {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Error clearing localStorage:', error);
            return false;
        }
    }

    // Auth token methods
    getAuthToken() {
        return this.get(STORAGE_KEYS.AUTH_TOKEN);
    }

    setAuthToken(token) {
        return this.set(STORAGE_KEYS.AUTH_TOKEN, token);
    }

    removeAuthToken() {
        return this.remove(STORAGE_KEYS.AUTH_TOKEN);
    }

    // User data methods
    getUserData() {
        return this.get(STORAGE_KEYS.USER_DATA);
    }

    setUserData(userData) {
        return this.set(STORAGE_KEYS.USER_DATA, userData);
    }

    removeUserData() {
        return this.remove(STORAGE_KEYS.USER_DATA);
    }

    // App settings methods
    getAppSettings() {
        return this.get(STORAGE_KEYS.APP_SETTINGS, DEFAULT_SETTINGS);
    }

    setAppSettings(settings) {
        return this.set(STORAGE_KEYS.APP_SETTINGS, { ...DEFAULT_SETTINGS, ...settings });
    }

    updateAppSettings(updates) {
        const current = this.getAppSettings();
        return this.setAppSettings({ ...current, ...updates });
    }

    // Theme methods
    getTheme() {
        return this.get(STORAGE_KEYS.THEME, DEFAULT_SETTINGS.theme);
    }

    setTheme(theme) {
        return this.set(STORAGE_KEYS.THEME, theme);
    }

    // Language methods
    getLanguage() {
        return this.get(STORAGE_KEYS.LANGUAGE, DEFAULT_SETTINGS.language);
    }

    setLanguage(language) {
        return this.set(STORAGE_KEYS.LANGUAGE, language);
    }

    // Recent agents methods
    getRecentAgents() {
        return this.get(STORAGE_KEYS.RECENT_AGENTS, []);
    }

    addRecentAgent(agentId) {
        const recent = this.getRecentAgents();
        const updated = [agentId, ...recent.filter(id => id !== agentId)].slice(0, 10);
        return this.set(STORAGE_KEYS.RECENT_AGENTS, updated);
    }

    removeRecentAgent(agentId) {
        const recent = this.getRecentAgents();
        const updated = recent.filter(id => id !== agentId);
        return this.set(STORAGE_KEYS.RECENT_AGENTS, updated);
    }

    // Chat history methods
    getChatHistory(agentId) {
        const allHistory = this.get(STORAGE_KEYS.CHAT_HISTORY, {});
        return allHistory[agentId] || [];
    }

    saveChatHistory(agentId, messages) {
        const allHistory = this.get(STORAGE_KEYS.CHAT_HISTORY, {});
        allHistory[agentId] = messages;
        return this.set(STORAGE_KEYS.CHAT_HISTORY, allHistory);
    }

    clearChatHistory(agentId) {
        const allHistory = this.get(STORAGE_KEYS.CHAT_HISTORY, {});
        if (allHistory[agentId]) {
            delete allHistory[agentId];
            return this.set(STORAGE_KEYS.CHAT_HISTORY, allHistory);
        }
        return true;
    }

    // Session storage methods (for temporary data)
    getSession(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading from sessionStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    setSession(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Error writing to sessionStorage key "${key}":`, error);
            return false;
        }
    }

    removeSession(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Error removing from sessionStorage key "${key}":`, error);
            return false;
        }
    }

    // Bulk operations
    exportData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                data[key] = this.get(key);
            } catch (error) {
                console.warn(`Error exporting key "${key}":`, error);
            }
        }
        return data;
    }

    importData(data) {
        let success = true;
        Object.entries(data).forEach(([key, value]) => {
            if (!this.set(key, value)) {
                success = false;
            }
        });
        return success;
    }

    // Migration helpers
    migrateKey(oldKey, newKey, transform = x => x) {
        const value = this.get(oldKey);
        if (value !== null) {
            this.set(newKey, transform(value));
            this.remove(oldKey);
        }
    }
}

// Create global storage instance
const storage = new StorageManager();

// Export for modules
export { storage, StorageManager };

// Export to global scope
window.AgentKStorage = storage;