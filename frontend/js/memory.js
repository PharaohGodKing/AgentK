import { MemoryManager } from './services/memory_manager.js';

// Initialize memory management
const memoryManager = new MemoryManager();

// Export memory functions
window.AgentKMemory = {
    init: () => memoryManager.initialize(),
    get: (agentId, limit) => memoryManager.getMemory(agentId, limit),
    add: (agentId, data) => memoryManager.addMemory(agentId, data),
    delete: (id) => memoryManager.deleteMemory(id),
    search: (agentId, query, limit) => memoryManager.searchMemory(agentId, query, limit),
    clear: (agentId) => memoryManager.clearMemory(agentId)
};

// Export for modules
export { memoryManager };