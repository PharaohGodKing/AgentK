export class StateManager {
    constructor() {
        this.state = new Map();
        this.subscribers = new Map();
    }

    setState(key, value) {
        const oldValue = this.state.get(key);
        this.state.set(key, value);
        
        // Notify subscribers
        this.notifySubscribers(key, value, oldValue);
    }

    getState(key) {
        return this.state.get(key);
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);
        
        // Return unsubscribe function
        return () => this.unsubscribe(key, callback);
    }

    unsubscribe(key, callback) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).delete(callback);
        }
    }

    notifySubscribers(key, newValue, oldValue) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error('Error in state subscriber:', error);
                }
            });
        }
    }

    clearState() {
        this.state.clear();
        this.subscribers.clear();
    }
}