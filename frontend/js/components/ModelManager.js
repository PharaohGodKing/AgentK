import { createElement, appendChildren } from '../utils/helpers.js';
import { apiClient } from '../api.js';
import { notificationService } from '../services/notification_service.js';

export class ModelManager {
    constructor() {
        this.element = null;
        this.models = [];
        this.connections = {};
    }

    async render() {
        this.element = createElement('div', 'model-manager');
        
        await this.loadModels();
        await this.loadConnectionStatus();
        
        const header = this.createHeader();
        const content = this.createContent();
        
        appendChildren(this.element, header, content);
        return this.element;
    }

    async loadModels() {
        try {
            const response = await apiClient.getModels();
            this.models = response.models || [];
        } catch (error) {
            console.error('Failed to load models:', error);
            this.models = [];
        }
    }

    async loadConnectionStatus() {
        try {
            const status = await apiClient.getModelStatus();
            this.connections = status;
        } catch (error) {
            console.error('Failed to load connection status:', error);
            this.connections = {};
        }
    }

    createHeader() {
        const header = createElement('div', 'model-header');
        
        const title = createElement('h2', {}, {
            textContent: 'Model Connections'
        });
        
        const refreshButton = createElement('button', 'btn btn-secondary', {
            textContent: 'Refresh Status'
        });
        
        refreshButton.addEventListener('click', () => this.refreshStatus());
        
        appendChildren(header, title, refreshButton);
        return header;
    }

    createContent() {
        const content = createElement('div', 'model-content');
        
        // Connection status cards
        const statusCards = this.createStatusCards();
        content.appendChild(statusCards);
        
        // Model list
        const modelList = this.createModelList();
        content.appendChild(modelList);
        
        return content;
    }

    createStatusCards() {
        const container = createElement('div', 'status-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4');
        
        const services = [
            { key: 'lmstudio', label: 'LM Studio', icon: '🤖' },
            { key: 'ollama', label: 'Ollama', icon: '🦙' },
            { key: 'openai', label: 'OpenAI', icon: '🔌' },
            { key: 'custom', label: 'Custom', icon: '⚙️' }
        ];
        
        services.forEach(service => {
            const isConnected = this.connections[service.key];
            const card = createElement('div', 'card status-card');
            
            const icon = createElement('div', 'status-icon', {
                textContent: service.icon
            });
            
            const title = createElement('h3', 'status-title', {
                textContent: service.label
            });
            
            const status = createElement('div', `status-indicator ${isConnected ? 'connected' : 'disconnected'}`, {
                textContent: isConnected ? 'Connected' : 'Disconnected'
            });
            
            const button = createElement('button', 'btn btn-sm', {
                textContent: isConnected ? 'Configure' : 'Connect'
            });
            
            button.addEventListener('click', () => this.configureService(service.key));
            
            appendChildren(card, icon, title, status, button);
            container.appendChild(card);
        });
        
        return container;
    }

    createModelList() {
        const container = createElement('div', 'model-list');
        const title = createElement('h3', {}, {
            textContent: 'Available Models'
        });
        
        const list = createElement('div', 'model-items');
        
        this.models.forEach(model => {
            const item = this.createModelItem(model);
            list.appendChild(item);
        });
        
        if (this.models.length === 0) {
            const empty = createElement('div', 'empty-state', {
                textContent: 'No models found. Connect to a service to see available models.'
            });
            list.appendChild(empty);
        }
        
        appendChildren(container, title, list);
        return container;
    }

    createModelItem(model) {
        const item = createElement('div', 'model-item card');
        
        const header = createElement('div', 'model-item-header');
        const name = createElement('h4', 'model-name', {
            textContent: model.name
        });
        
        const type = createElement('span', 'badge', {
            textContent: model.type
        });
        
        appendChildren(header, name, type);
        
        const actions = createElement('div', 'model-actions');
        const useButton = createElement('button', 'btn btn-primary btn-sm', {
            textContent: 'Use This Model'
        });
        
        useButton.addEventListener('click', () => this.useModel(model));
        
        actions.appendChild(useButton);
        appendChildren(item, header, actions);
        return item;
    }

    async refreshStatus() {
        try {
            await this.loadConnectionStatus();
            this.updateStatusDisplay();
            notificationService.success('Connection status updated');
        } catch (error) {
            console.error('Failed to refresh status:', error);
            notificationService.error('Failed to refresh connection status');
        }
    }

    updateStatusDisplay() {
        const cards = this.element.querySelectorAll('.status-card');
        cards.forEach(card => {
            const title = card.querySelector('.status-title');
            if (!title) return;
            
            const serviceKey = this.getServiceKeyFromTitle(title.textContent);
            const isConnected = this.connections[serviceKey];
            const status = card.querySelector('.status-indicator');
            const button = card.querySelector('button');
            
            if (status) {
                status.className = `status-indicator ${isConnected ? 'connected' : 'disconnected'}`;
                status.textContent = isConnected ? 'Connected' : 'Disconnected';
            }
            
            if (button) {
                button.textContent = isConnected ? 'Configure' : 'Connect';
            }
        });
    }

    getServiceKeyFromTitle(title) {
        const mapping = {
            'LM Studio': 'lmstudio',
            'Ollama': 'ollama',
            'OpenAI': 'openai',
            'Custom': 'custom'
        };
        return mapping[title] || title.toLowerCase();
    }

    async configureService(serviceKey) {
        // Show configuration modal
        const modal = this.createConfigModal(serviceKey);
        document.body.appendChild(modal);
        
        // TODO: Implement service configuration
        console.log('Configuring service:', serviceKey);
    }

    createConfigModal(serviceKey) {
        const modal = createElement('div', 'modal');
        
        const content = createElement('div', 'modal-content');
        const header = createElement('div', 'modal-header');
        const title = createElement('h3', 'modal-title', {
            textContent: `Configure ${serviceKey}`
        });
        
        const closeButton = createElement('button', 'modal-close', {
            textContent: '×',
            'aria-label': 'Close'
        });
        
        closeButton.addEventListener('click', () => modal.remove());
        
        const body = createElement('div', 'modal-body');
        const form = this.createConfigForm(serviceKey);
        
        appendChildren(header, title, closeButton);
        appendChildren(body, form);
        appendChildren(content, header, body);
        appendChildren(modal, content);
        
        return modal;
    }

    createConfigForm(serviceKey) {
        const form = createElement('form', 'config-form');
        
        // Add form fields based on service type
        switch (serviceKey) {
            case 'lmstudio':
                this.addLMStudioFields(form);
                break;
            case 'ollama':
                this.addOllamaFields(form);
                break;
            case 'openai':
                this.addOpenAIFields(form);
                break;
            case 'custom':
                this.addCustomFields(form);
                break;
        }
        
        const submitButton = createElement('button', 'btn btn-primary', {
            type: 'submit',
            textContent: 'Save Configuration'
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfiguration(serviceKey, new FormData(form));
        });
        
        form.appendChild(submitButton);
        return form;
    }

    addLMStudioFields(form) {
        this.addFormField(form, 'url', 'URL', 'text', 'http://localhost:1234');
        this.addFormField(form, 'timeout', 'Timeout (ms)', 'number', '30000');
    }

    addOllamaFields(form) {
        this.addFormField(form, 'url', 'URL', 'text', 'http://localhost:11434');
        this.addFormField(form, 'timeout', 'Timeout (ms)', 'number', '30000');
    }

    addOpenAIFields(form) {
        this.addFormField(form, 'apiKey', 'API Key', 'password', '');
        this.addFormField(form, 'model', 'Default Model', 'text', 'gpt-4');
        this.addFormField(form, 'baseURL', 'Base URL', 'text', 'https://api.openai.com/v1');
    }

    addCustomFields(form) {
        this.addFormField(form, 'url', 'API URL', 'text', '');
        this.addFormField(form, 'apiKey', 'API Key', 'password', '');
        this.addFormField(form, 'model', 'Model Name', 'text', '');
        this.addFormField(form, 'format', 'Response Format', 'text', 'json');
    }

    addFormField(form, name, label, type, placeholder = '') {
        const group = createElement('div', 'form-group');
        
        const labelEl = createElement('label', 'form-label', {
            textContent: label,
            htmlFor: name
        });
        
        const input = createElement('input', 'form-input', {
            type: type,
            id: name,
            name: name,
            placeholder: placeholder
        });
        
        appendChildren(group, labelEl, input);
        form.appendChild(group);
    }

    async saveConfiguration(serviceKey, formData) {
        try {
            const config = Object.fromEntries(formData.entries());
            await apiClient.testConnection(serviceKey, config);
            
            // Save configuration to storage or backend
            notificationService.success(`${serviceKey} configuration saved and tested successfully`);
            
            // Close modal
            const modal = this.element.querySelector('.modal');
            if (modal) modal.remove();
            
            // Refresh status
            await this.refreshStatus();
            
        } catch (error) {
            console.error('Failed to save configuration:', error);
            notificationService.error('Failed to save configuration');
        }
    }

    async useModel(model) {
        try {
            await apiClient.switchModel(model.type, model.name);
            notificationService.success(`Switched to ${model.name}`);
        } catch (error) {
            console.error('Failed to switch model:', error);
            notificationService.error('Failed to switch model');
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}