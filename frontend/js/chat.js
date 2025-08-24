import { ChatManager } from './services/chat_manager.js';
import { ChatWindow } from './components/ChatWindow.js';

// Initialize chat management
const chatManager = new ChatManager();

// Export chat functions
window.AgentKChat = {
    init: () => chatManager.initialize(),
    open: (agentId) => chatManager.openChat(agentId),
    send: (agentId, message) => chatManager.sendMessage(agentId, message),
    getHistory: (agentId) => chatManager.getHistory(agentId),
    clear: (agentId) => chatManager.clearHistory(agentId),
    renderWindow: (agentId, container) => {
        const window = new ChatWindow(agentId);
        container.appendChild(window.render());
    }
};

// Export for modules
export { chatManager, ChatWindow };