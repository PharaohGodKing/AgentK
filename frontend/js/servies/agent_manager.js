import { apiClient } from '../api.js';
import { storage } from '../utils/storage.js';
import { NotificationService } from './notification_service.js';

export class AgentManager {
    constructor() {
        this.agents = new Map();
        this.notificationService = new NotificationService();
    }

    async initialize() {
        try {
            await this.loadAgents();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize AgentManager:', error);
            this.notificationService.error('Failed to load agents');
        }
    }

    async loadAgents() {
        try {
            const agents = await apiClient.getAgents();
            this.agents.clear();
            agents.forEach(agent => this.agents.set(agent.id, agent));
            this.emitAgentsUpdated();
        } catch (error) {
            console.error('Failed to load agents:', error);
            throw error;
        }
    }

    async getAgents() {
        if (this.agents.size === 0) {
            await this.loadAgents();
        }
        return Array.from(this.agents.values());
    }

    async getAgent(id) {
        if (this.agents.has(id)) {
            return this.agents.get(id);
        }

        try {
            const agent = await apiClient.getAgent(id);
            this.agents.set(id, agent);
            return agent;
        } catch (error) {
            console.error(`Failed to get agent ${id}:`, error);
            throw error;
        }
    }

    async createAgent(agentData) {
        try {
            const agent = await apiClient.createAgent(agentData);
            this.agents.set(agent.id, agent);
            this.emitAgentCreated(agent);
            this.notificationService.success('Agent created successfully');
            return agent;
        } catch (error) {
            console.error('Failed to create agent:', error);
            this.notificationService.error('Failed to create agent');
            throw error;
        }
    }

    async updateAgent(id, agentData) {
        try {
            const agent = await apiClient.updateAgent(id, agentData);
            this.agents.set(id, agent);
            this.emitAgentUpdated(agent);
            this.notificationService.success('Agent updated successfully');
            return agent;
        } catch (error) {
            console.error(`Failed to update agent ${id}:`, error);
            this.notificationService.error('Failed to update agent');
            throw error;
        }
    }

    async deleteAgent(id) {
        try {
            await apiClient.deleteAgent(id);
            this.agents.delete(id);
            this.emitAgentDeleted(id);
            this.notificationService.success('Agent deleted successfully');
            return true;
        } catch (error) {
            console.error(`Failed to delete agent ${id}:`, error);
            this.notificationService.error('Failed to delete agent');
            throw error;
        }
    }

    async activateAgent(id) {
        try {
            await apiClient.activateAgent(id);
            const agent = await this.getAgent(id);
            agent.status = 'active';
            this.agents.set(id, agent);
            this.emitAgentStatusChanged(agent);
            this.notificationService.success('Agent activated successfully');
            return true;
        } catch (error) {
            console.error(`Failed to activate agent ${id}:`, error);
            this.notificationService.error('Failed to activate agent');
            throw error;
        }
    }

    async deactivateAgent(id) {
        try {
            await apiClient.deactivateAgent(id);
            const agent = await this.getAgent(id);
            agent.status = 'inactive';
            this.agents.set(id, agent);
            this.emitAgentStatusChanged(agent);
            this.notificationService.success('Agent deactivated successfully');
            return true;
        } catch (error) {
            console.error(`Failed to deactivate agent ${id}:`, error);
            this.notificationService.error('Failed to deactivate agent');
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for agent-related events
        document.addEventListener('agent:created', (event) => {
            this.handleAgentCreated(event.detail);
        });

        document.addEventListener('agent:updated', (event) => {
            this.handleAgentUpdated(event.detail);
        });

        document.addEventListener('agent:deleted', (event) => {
            this.handleAgentDeleted(event.detail);
        });

        document.addEventListener('agent:status-changed', (event) => {
            this.handleAgentStatusChanged(event.detail);
        });
    }

    handleAgentCreated(agent) {
        this.agents.set(agent.id, agent);
        storage.addRecentAgent(agent.id);
    }

    handleAgentUpdated(agent) {
        this.agents.set(agent.id, agent);
    }

    handleAgentDeleted(agentId) {
        this.agents.delete(agentId);
        storage.removeRecentAgent(agentId);
    }

    handleAgentStatusChanged(agent) {
        this.agents.set(agent.id, agent);
    }

    emitAgentsUpdated() {
        const event = new CustomEvent('agents:updated', {
            detail: Array.from(this.agents.values())
        });
        document.dispatchEvent(event);
    }

    emitAgentCreated(agent) {
        const event = new CustomEvent('agent:created', { detail: agent });
        document.dispatchEvent(event);
    }

    emitAgentUpdated(agent) {
        const event = new CustomEvent('agent:updated', { detail: agent });
        document.dispatchEvent(event);
    }

    emitAgentDeleted(agentId) {
        const event = new CustomEvent('agent:deleted', { detail: agentId });
        document.dispatchEvent(event);
    }

    emitAgentStatusChanged(agent) {
        const event = new CustomEvent('agent:status-changed', { detail: agent });
        document.dispatchEvent(event);
    }

    // Search and filter methods
    searchAgents(query) {
        const searchTerm = query.toLowerCase();
        return Array.from(this.agents.values()).filter(agent =>
            agent.name.toLowerCase().includes(searchTerm) ||
            agent.description.toLowerCase().includes(searchTerm) ||
            agent.model.toLowerCase().includes(searchTerm) ||
            agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm))
        );
    }

    filterAgentsByStatus(status) {
        return Array.from(this.agents.values()).filter(agent => agent.status === status);
    }

    filterAgentsByCapability(capability) {
        return Array.from(this.agents.values()).filter(agent =>
            agent.capabilities.includes(capability)
        );
    }

    // Statistics methods
    getAgentStats() {
        const agents = Array.from(this.agents.values());
        return {
            total: agents.length,
            active: agents.filter(a => a.status === 'active').length,
            inactive: agents.filter(a => a.status === 'inactive').length,
            busy: agents.filter(a => a.status === 'busy').length,
            error: agents.filter(a => a.status === 'error').length
        };
    }

    // Import/export methods
    exportAgentConfig(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;

        return {
            name: agent.name,
            description: agent.description,
            model: agent.model,
            capabilities: agent.capabilities,
            config: agent.config
        };
    }

    importAgentConfig(config) {
        return this.createAgent(config);
    }
}