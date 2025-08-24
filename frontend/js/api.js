import { ApiClient } from './services/api_client.js';

// Create a global API client instance
const apiClient = new ApiClient();

// Export API functions for global use
window.AgentKAPI = {
    // Agent methods
    getAgents: () => apiClient.getAgents(),
    getAgent: (id) => apiClient.getAgent(id),
    createAgent: (data) => apiClient.createAgent(data),
    updateAgent: (id, data) => apiClient.updateAgent(id, data),
    deleteAgent: (id) => apiClient.deleteAgent(id),
    activateAgent: (id) => apiClient.activateAgent(id),
    deactivateAgent: (id) => apiClient.deactivateAgent(id),

    // Chat methods
    sendMessage: (data) => apiClient.sendMessage(data),
    getChatHistory: (agentId) => apiClient.getChatHistory(agentId),

    // Workflow methods
    getWorkflows: () => apiClient.getWorkflows(),
    getWorkflow: (id) => apiClient.getWorkflow(id),
    createWorkflow: (data) => apiClient.createWorkflow(data),
    updateWorkflow: (id, data) => apiClient.updateWorkflow(id, data),
    deleteWorkflow: (id) => apiClient.deleteWorkflow(id),
    executeWorkflow: (id, data) => apiClient.executeWorkflow(id, data),

    // Model methods
    getModels: () => apiClient.getModels(),
    getModelStatus: () => apiClient.getModelStatus(),
    testConnection: (type, config) => apiClient.testConnection(type, config),
    switchModel: (type, name) => apiClient.switchModel(type, name),

    // Memory methods
    getMemory: (agentId, limit) => apiClient.getMemory(agentId, limit),
    addMemory: (agentId, data) => apiClient.addMemory(agentId, data),
    deleteMemory: (id) => apiClient.deleteMemory(id),
    searchMemory: (agentId, query, limit) => apiClient.searchMemory(agentId, query, limit),

    // System methods
    getSystemStatus: () => apiClient.getSystemStatus(),
    getSystemMetrics: () => apiClient.getSystemMetrics(),
    getSystemLogs: (limit) => apiClient.getSystemLogs(limit),

    // File methods
    listFiles: (directory) => apiClient.listFiles(directory),
    uploadFile: (file, directory, agentId) => apiClient.uploadFile(file, directory, agentId),
    deleteFile: (path) => apiClient.deleteFile(path),

    // Plugin methods
    getPlugins: () => apiClient.getPlugins(),
    getPlugin: (id) => apiClient.getPlugin(id),
    installPlugin: (id) => apiClient.installPlugin(id),
    uninstallPlugin: (id) => apiClient.uninstallPlugin(id),
    activatePlugin: (id) => apiClient.activatePlugin(id),
    deactivatePlugin: (id) => apiClient.deactivatePlugin(id),
    executePlugin: (id, params) => apiClient.executePlugin(id, params)
};

// Export for modules
export { apiClient };