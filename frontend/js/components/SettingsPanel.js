import { createElement, appendChildren } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { THEMES } from '../utils/constants.js';

export class SettingsPanel {
    constructor() {
        this.element = null;
        this.settings = storage.getAppSettings();
    }

    render() {
        this.element = createElement('div', 'settings-panel');
        
        const header = this.createHeader();
        const tabs = this.createTabs();
        const content = this.createContent();
        
        appendChildren(this.element, header, tabs, content);
        this.setupEventListeners();
        
        return this.element;
    }

    createHeader() {
        const header = createElement('div', 'settings-header');
        
        const title = createElement('h1', {}, {
            textContent: 'Settings'
        });
        
        const subtitle = createElement('p', 'text-muted', {
            textContent: 'Configure your AgentK experience'
        });
        
        appendChildren(header, title, subtitle);
        return header;
    }

    createTabs() {
        const tabs = createElement('div', 'settings-tabs tabs');
        
        const tabItems = [
            { id: 'general', label: 'General', icon: '⚙️' },
            { id: 'appearance', label: 'Appearance', icon: '🎨' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' },
            { id: 'privacy', label: 'Privacy', icon: '🔒' },
            { id: 'advanced', label: 'Advanced', icon: '💻' }
        ];
        
        tabItems.forEach((tab, index) => {
            const tabElement = createElement('button', `tab ${index === 0 ? 'active' : ''}`, {
                'data-tab': tab.id,
                textContent: `${tab.icon} ${tab.label}`
            });
            
            tabElement.addEventListener('click', () => this.switchTab(tab.id));
            tabs.appendChild(tabElement);
        });
        
        return tabs;
    }

    createContent() {
        const content = createElement('div', 'settings-content');
        
        // General settings
        const general = this.createGeneralSettings();
        general.classList.add('tab-content', 'active');
        general.id = 'tab-general';
        
        // Appearance settings
        const appearance = this.createAppearanceSettings();
        appearance.classList.add('tab-content');
        appearance.id = 'tab-appearance';
        
        // Notifications settings
        const notifications = this.createNotificationsSettings();
        notifications.classList.add('tab-content');
        notifications.id = 'tab-notifications';
        
        // Privacy settings
        const privacy = this.createPrivacySettings();
        privacy.classList.add('tab-content');
        privacy.id = 'tab-privacy';
        
        // Advanced settings
        const advanced = this.createAdvancedSettings();
        advanced.classList.add('tab-content');
        advanced.id = 'tab-advanced';
        
        appendChildren(content, general, appearance, notifications, privacy, advanced);
        return content;
    }

    createGeneralSettings() {
        const container = createElement('div', 'settings-section');
        
        const title = createElement('h2', {}, {
            textContent: 'General Settings'
        });
        
        const form = createElement('form', 'settings-form');
        
        // Language selection
        this.addFormField(form, 'language', 'Language', 'select', {
            options: [
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' }
            ],
            value: this.settings.language
        });
        
        // Auto-save
        this.addFormField(form, 'autoSave', 'Auto Save', 'checkbox', {
            checked: this.settings.autoSave,
            description: 'Automatically save changes'
        });
        
        // Auto-save interval
        this.addFormField(form, 'autoSaveInterval', 'Auto Save Interval (ms)', 'number', {
            value: this.settings.autoSaveInterval,
            min: 1000,
            max: 60000,
            step: 1000
        });
        
        const saveButton = createElement('button', 'btn btn-primary', {
            type: 'submit',
            textContent: 'Save General Settings'
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGeneralSettings(new FormData(form));
        });
        
        form.appendChild(saveButton);
        appendChildren(container, title, form);
        return container;
    }

    createAppearanceSettings() {
        const container = createElement('div', 'settings-section');
        
        const title = createElement('h2', {}, {
            textContent: 'Appearance'
        });
        
        const form = createElement('form', 'settings-form');
        
        // Theme selection
        this.addFormField(form, 'theme', 'Theme', 'select', {
            options: [
                { value: THEMES.LIGHT, label: 'Light' },
                { value: THEMES.DARK, label: 'Dark' },
                { value: THEMES.HIGH_CONTRAST, label: 'High Contrast' }
            ],
            value: this.settings.theme
        });
        
        // Font size
        this.addFormField(form, 'fontSize', 'Font Size', 'select', {
            options: [
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' }
            ],
            value: this.settings.fontSize
        });
        
        // Reduce motion
        this.addFormField(form, 'reduceMotion', 'Reduce Motion', 'checkbox', {
            checked: this.settings.reduceMotion,
            description: 'Reduce animations and transitions'
        });
        
        const saveButton = createElement('button', 'btn btn-primary', {
            type: 'submit',
            textContent: 'Save Appearance Settings'
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAppearanceSettings(new FormData(form));
        });
        
        form.appendChild(saveButton);
        appendChildren(container, title, form);
        return container;
    }

    createNotificationsSettings() {
        const container = createElement('div', 'settings-section');
        
        const title = createElement('h2', {}, {
            textContent: 'Notifications'
        });
        
        const form = createElement('form', 'settings-form');
        
        // Enable notifications
        this.addFormField(form, 'notifications', 'Enable Notifications', 'checkbox', {
            checked: this.settings.notifications,
            description: 'Show desktop notifications'
        });
        
        // Sound effects
        this.addFormField(form, 'soundEffects', 'Sound Effects', 'checkbox', {
            checked: this.settings.soundEffects,
            description: 'Play sounds for notifications'
        });
        
        // Notification types
        this.addFormField(form, 'notifyOnSuccess', 'Success Notifications', 'checkbox', {
            checked: true,
            description: 'Notify on successful operations'
        });
        
        this.addFormField(form, 'notifyOnError', 'Error Notifications', 'checkbox', {
            checked: true,
            description: 'Notify on errors'
        });
        
        this.addFormField(form, 'notifyOnWarning', 'Warning Notifications', 'checkbox', {
            checked: true,
            description: 'Notify on warnings'
        });
        
        const saveButton = createElement('button', 'btn btn-primary', {
            type: 'submit',
            textContent: 'Save Notification Settings'
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNotificationSettings(new FormData(form));
        });
        
        form.appendChild(saveButton);
        appendChildren(container, title, form);
        return container;
    }

    createPrivacySettings() {
        const container = createElement('div', 'settings-section');
        
        const title = createElement('h2', {}, {
            textContent: 'Privacy & Data'
        });
        
        const form = createElement('form', 'settings-form');
        
        // Data collection
        this.addFormField(form, 'analytics', 'Usage Analytics', 'checkbox', {
            checked: false,
            description: 'Send anonymous usage data to help improve AgentK'
        });
        
        // Chat history retention
        this.addFormField(form, 'chatHistoryRetention', 'Chat History Retention (days)', 'number', {
            value: 30,
            min: 1,
            max: 365,
            description: 'How long to keep chat history'
        });
        
        // Clear data buttons
        const clearSection = createElement('div', 'form-group');
        const clearLabel = createElement('label', 'form-label', {
            textContent: 'Clear Data'
        });
        
        const clearChat = createElement('button', 'btn btn-warning', {
            type: 'button',
            textContent: 'Clear All Chat History'
        });
        
        const clearAll = createElement('button', 'btn btn-danger', {
            type: 'button',
            textContent: 'Clear All Data'
        });
        
        clearChat.addEventListener('click', () => this.clearChatHistory());
        clearAll.addEventListener('click', () => this.clearAllData());
        
        appendChildren(clearSection, clearLabel, clearChat, clearAll);
        form.appendChild(clearSection);
        
        const saveButton = createElement('button', 'btn btn-primary', {
            type: 'submit',
            textContent: 'Save Privacy Settings'
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePrivacySettings(new FormData(form));
        });
        
        form.appendChild(saveButton);
        appendChildren(container, title, form);
        return container;
    }

    createAdvancedSettings() {
        const container = createElement('div', 'settings-section');
        
        const title = createElement('h2', {}, {
            textContent: 'Advanced Settings'
        });
        
        const warning = createElement('div', 'alert alert-warning', {
            textContent: 'Warning: These settings are for advanced users. Changing them may affect system stability.'
        });
        
        const form = createElement('form', 'settings-form');
        
        // API URL
        this.addFormField(form, 'apiUrl', 'API Base URL', 'text', {
            value: window.API_BASE_URL || '',
            placeholder: 'https://localhost:8000/api'
        });
        
        // Cache size
        this.addFormField(form, 'cacheSize', 'Cache Size (MB)', 'number', {
            value: 100,
            min: 10,
            max: 1000,
            description: 'Maximum cache size in megabytes'
        });
        
        // Debug mode
        this.addFormField(form, 'debugMode', 'Debug Mode', 'checkbox', {
            checked: false,
            description: 'Enable debug logging and tools'
        });
        
        const saveButton = createElement('button', 'btn btn-primary', {
            type: 'submit',
            textContent: 'Save Advanced Settings'
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAdvancedSettings(new FormData(form));
        });
        
        appendChildren(container, title, warning, form, saveButton);
        return container;
    }

    addFormField(form, name, label, type, options = {}) {
        const group = createElement('div', 'form-group');
        
        const labelEl = createElement('label', 'form-label', {
            textContent: label,
            htmlFor: name
        });
        
        let input;
        
        switch (type) {
            case 'select':
                input = createElement('select', 'form-select', {
                    id: name,
                    name: name
                });
                
                options.options.forEach(opt => {
                    const option = createElement('option', {
                        value: opt.value,
                        textContent: opt.label,
                        selected: opt.value === options.value
                    });
                    input.appendChild(option);
                });
                break;
                
            case 'checkbox':
                input = createElement('input', 'form-check-input', {
                    type: 'checkbox',
                    id: name,
                    name: name,
                    checked: options.checked
                });
                
                const checkContainer = createElement('div', 'form-check');
                const checkLabel = createElement('label', 'form-check-label', {
                    htmlFor: name,
                    textContent: options.description || label
                });
                
                appendChildren(checkContainer, input, checkLabel);
                group.appendChild(checkContainer);
                break;
                
            default:
                input = createElement('input', 'form-input', {
                    type: type,
                    id: name,
                    name: name,
                    value: options.value,
                    placeholder: options.placeholder,
                    min: options.min,
                    max: options.max,
                    step: options.step
                });
        }
        
        if (type !== 'checkbox') {
            appendChildren(group, labelEl, input);
        }
        
        if (options.description && type !== 'checkbox') {
            const desc = createElement('small', 'form-text text-muted', {
                textContent: options.description
            });
            group.appendChild(desc);
        }
        
        form.appendChild(group);
        return input;
    }

    switchTab(tabId) {
        // Update tabs
        const tabs = this.element.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        // Update content
        const contents = this.element.querySelectorAll('.tab-content');
        contents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
    }

    setupEventListeners() {
        // Theme preview
        const themeSelect = this.element.querySelector('select[name="theme"]');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.previewTheme(e.target.value);
            });
        }
    }

    previewTheme(theme) {
        document.body.className = `${theme}-theme`;
    }

    async saveGeneralSettings(formData) {
        const updates = {
            language: formData.get('language'),
            autoSave: formData.get('autoSave') === 'on',
            autoSaveInterval: parseInt(formData.get('autoSaveInterval') || '30000')
        };
        
        await this.saveSettings(updates, 'General settings saved');
    }

    async saveAppearanceSettings(formData) {
        const theme = formData.get('theme');
        const updates = {
            theme: theme,
            fontSize: formData.get('fontSize'),
            reduceMotion: formData.get('reduceMotion') === 'on'
        };
        
        await this.saveSettings(updates, 'Appearance settings saved');
        
        // Apply theme immediately
        document.body.className = `${theme}-theme`;
    }

    async saveNotificationSettings(formData) {
        const updates = {
            notifications: formData.get('notifications') === 'on',
            soundEffects: formData.get('soundEffects') === 'on'
        };
        
        await this.saveSettings(updates, 'Notification settings saved');
    }

    async savePrivacySettings(formData) {
        const updates = {
            analytics: formData.get('analytics') === 'on'
        };
        
        await this.saveSettings(updates, 'Privacy settings saved');
    }

    async saveAdvancedSettings(formData) {
        const updates = {
            apiUrl: formData.get('apiUrl'),
            debugMode: formData.get('debugMode') === 'on'
        };
        
        await this.saveSettings(updates, 'Advanced settings saved');
    }

    async saveSettings(updates, successMessage) {
        try {
            this.settings = { ...this.settings, ...updates };
            storage.setAppSettings(this.settings);
            
            // Dispatch settings changed event
            const event = new CustomEvent('settings:changed', {
                detail: this.settings
            });
            document.dispatchEvent(event);
            
            notificationService.success(successMessage);
        } catch (error) {
            console.error('Failed to save settings:', error);
            notificationService.error('Failed to save settings');
        }
    }

    async clearChatHistory() {
        if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
            try {
                // Clear from storage
                storage.remove('chat_history');
                
                // TODO: Clear from server if needed
                
                notificationService.success('Chat history cleared successfully');
            } catch (error) {
                console.error('Failed to clear chat history:', error);
                notificationService.error('Failed to clear chat history');
            }
        }
    }

    async clearAllData() {
        if (confirm('Are you sure you want to clear ALL data? This will reset the application to its initial state and cannot be undone.')) {
            try {
                // Clear all storage
                storage.clear();
                
                // Reload the application
                window.location.reload();
            } catch (error) {
                console.error('Failed to clear data:', error);
                notificationService.error('Failed to clear data');
            }
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}