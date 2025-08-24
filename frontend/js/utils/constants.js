// Application constants
export const APP_NAME = 'AgentK';
export const APP_VERSION = '1.0.0';
export const API_BASE_URL = window.location.origin + '/api';

// Local storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    APP_SETTINGS: 'app_settings',
    THEME: 'theme',
    LANGUAGE: 'language',
    RECENT_AGENTS: 'recent_agents',
    CHAT_HISTORY: 'chat_history'
};

// API endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    
    // Agents
    AGENTS: '/agents',
    AGENT: (id) => `/agents/${id}`,
    AGENT_ACTIVATE: (id) => `/agents/${id}/activate`,
    AGENT_DEACTIVATE: (id) => `/agents/${id}/deactivate`,
    
    // Chat
    CHAT: '/chat',
    CHAT_HISTORY: (agentId) => `/chat/${agentId}/history`,
    CHAT_WS: (agentId) => `/chat/ws/${agentId}`,
    
    // Workflows
    WORKFLOWS: '/workflows',
    WORKFLOW: (id) => `/workflows/${id}`,
    WORKFLOW_EXECUTE: (id) => `/workflows/${id}/execute`,
    
    // Models
    MODELS: '/models',
    MODEL_STATUS: '/models/status',
    TEST_CONNECTION: '/models/test-connection',
    SWITCH_MODEL: '/models/switch',
    
    // Memory
    MEMORY: (agentId) => `/memory/${agentId}`,
    MEMORY_SEARCH: (agentId) => `/memory/${agentId}/search`,
    MEMORY_ITEM: (id) => `/memory/${id}`,
    
    // System
    SYSTEM_STATUS: '/system/status',
    SYSTEM_METRICS: '/system/metrics',
    SYSTEM_LOGS: '/system/logs',
    
    // Files
    FILES: '/files',
    FILE_UPLOAD: '/files/upload',
    FILE_DOWNLOAD: (path) => `/files/download/${path}`,
    FILE_DELETE: (path) => `/files/${path}`,
    
    // Plugins
    PLUGINS: '/plugins',
    PLUGIN: (id) => `/plugins/${id}`,
    PLUGIN_INSTALL: (id) => `/plugins/${id}/install`,
    PLUGIN_UNINSTALL: (id) => `/plugins/${id}/uninstall`,
    PLUGIN_ACTIVATE: (id) => `/plugins/${id}/activate`,
    PLUGIN_DEACTIVATE: (id) => `/plugins/${id}/deactivate`,
    PLUGIN_EXECUTE: (id) => `/plugins/${id}/execute`
};

// Agent capabilities
export const AGENT_CAPABILITIES = {
    WEB_RESEARCH: 'web_research',
    CODE_GENERATION: 'code_generation',
    DATA_ANALYSIS: 'data_analysis',
    CONTENT_WRITING: 'content_writing',
    IMAGE_GENERATION: 'image_generation',
    FILE_PROCESSING: 'file_processing'
};

// Agent status
export const AGENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BUSY: 'busy',
    ERROR: 'error'
};

// Model types
export const MODEL_TYPES = {
    LM_STUDIO: 'lmstudio',
    OLLAMA: 'ollama',
    OPENAI: 'openai',
    CUSTOM: 'custom'
};

// Notification types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Theme options
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    HIGH_CONTRAST: 'high-contrast'
};

// Default settings
export const DEFAULT_SETTINGS = {
    theme: THEMES.DARK,
    language: 'en',
    autoSave: true,
    autoSaveInterval: 30000,
    notifications: true,
    soundEffects: true,
    fontSize: 'medium',
    reduceMotion: false
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Unauthorized. Please log in again.',
    FORBIDDEN: 'Access forbidden.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Validation failed. Please check your input.',
    UNKNOWN_ERROR: 'An unknown error occurred.'
};

// Success messages
export const SUCCESS_MESSAGES = {
    AGENT_CREATED: 'Agent created successfully.',
    AGENT_UPDATED: 'Agent updated successfully.',
    AGENT_DELETED: 'Agent deleted successfully.',
    AGENT_ACTIVATED: 'Agent activated successfully.',
    AGENT_DEACTIVATED: 'Agent deactivated successfully.',
    WORKFLOW_CREATED: 'Workflow created successfully.',
    WORKFLOW_UPDATED: 'Workflow updated successfully.',
    WORKFLOW_DELETED: 'Workflow deleted successfully.',
    MESSAGE_SENT: 'Message sent successfully.',
    FILE_UPLOADED: 'File uploaded successfully.',
    FILE_DELETED: 'File deleted successfully.',
    SETTINGS_SAVED: 'Settings saved successfully.'
};

// Event names
export const EVENTS = {
    AGENT_CREATED: 'agent:created',
    AGENT_UPDATED: 'agent:updated',
    AGENT_DELETED: 'agent:deleted',
    AGENT_STATUS_CHANGED: 'agent:status-changed',
    MESSAGE_RECEIVED: 'message:received',
    WORKFLOW_EXECUTED: 'workflow:executed',
    SETTINGS_CHANGED: 'settings:changed',
    THEME_CHANGED: 'theme:changed',
    NOTIFICATION: 'notification'
};

// Export constants to global scope
window.AgentKConstants = {
    APP_NAME,
    APP_VERSION,
    API_BASE_URL,
    STORAGE_KEYS,
    API_ENDPOINTS,
    AGENT_CAPABILITIES,
    AGENT_STATUS,
    MODEL_TYPES,
    NOTIFICATION_TYPES,
    THEMES,
    DEFAULT_SETTINGS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    EVENTS
};