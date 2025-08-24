import { AgentManager } from './services/agent_manager.js';
import { AgentCard } from './components/AgentCard.js';

// Initialize agent management
const agentManager = new AgentManager();

// Export agent functions
window.AgentKAgents = {
    init: () => agentManager.initialize(),
    getAll: () => agentManager.getAgents(),
    get: (id) => agentManager.getAgent(id),
    create: (data) => agentManager.createAgent(data),
    update: (id, data) => agentManager.updateAgent(id, data),
    delete: (id) => agentManager.deleteAgent(id),
    activate: (id) => agentManager.activateAgent(id),
    deactivate: (id) => agentManager.deactivateAgent(id),
    renderCard: (agent, container) => {
        const card = new AgentCard(agent);
        container.appendChild(card.render());
    }
};

// Export for modules
export { agentManager, AgentCard };