import { createElement, appendChildren, formatDate } from '../utils/helpers.js';
import { AGENT_CAPABILITIES, AGENT_STATUS } from '../utils/constants.js';

export class AgentCard {
    constructor(agent) {
        this.agent = agent;
        this.element = null;
    }

    render() {
        this.element = createElement('div', 'card agent-card');
        
        const header = this.createHeader();
        const content = this.createContent();
        const footer = this.createFooter();
        
        appendChildren(this.element, header, content, footer);
        return this.element;
    }

    createHeader() {
        const header = createElement('div', 'card-header');
        
        const title = createElement('h3', 'card-title', {}, {
            textContent: this.agent.name
        });
        
        const status = createElement('span', `status status-${this.agent.status}`, {}, {
            textContent: this.formatStatus(this.agent.status)
        });
        
        const actions = createElement('div', 'card-actions');
        const menuButton = this.createMenuButton();
        actions.appendChild(menuButton);
        
        appendChildren(header, title, status, actions);
        return header;
    }

    createContent() {
        const content = createElement('div', 'card-content');
        
        const description = createElement('p', 'agent-description', {}, {
            textContent: this.agent.description
        });
        
        const model = createElement('div', 'agent-model', {}, {
            textContent: `Model: ${this.agent.model}`
        });
        
        const capabilities = this.createCapabilities();
        
        appendChildren(content, description, model, capabilities);
        return content;
    }

    createFooter() {
        const footer = createElement('div', 'card-footer');
        
        const createdAt = createElement('span', 'text-muted', {}, {
            textContent: `Created: ${formatDate(this.agent.created_at)}`
        });
        
        const actionButtons = createElement('div', 'action-buttons');
        const chatButton = this.createChatButton();
        const activateButton = this.createActivateButton();
        
        appendChildren(actionButtons, chatButton, activateButton);
        appendChildren(footer, createdAt, actionButtons);
        return footer;
    }

    createCapabilities() {
        const container = createElement('div', 'agent-capabilities');
        const title = createElement('strong', {}, {}, {
            textContent: 'Capabilities: '
        });
        
        const badges = this.agent.capabilities.map(capability => {
            return createElement('span', 'badge badge-secondary', {}, {
                textContent: this.formatCapability(capability)
            });
        });
        
        appendChildren(container, title, ...badges);
        return container;
    }

    createMenuButton() {
        const button = createElement('button', 'btn btn-ghost btn-sm', {}, {
            type: 'button',
            'aria-label': 'Agent options'
        });
        
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
            </svg>
        `;
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showMenu(e.target);
        });
        
        return button;
    }

    createChatButton() {
        const button = createElement('button', 'btn btn-primary btn-sm', {}, {
            type: 'button',
            textContent: 'Chat'
        });
        
        button.addEventListener('click', () => {
            this.openChat();
        });
        
        return button;
    }

    createActivateButton() {
        const isActive = this.agent.status === AGENT_STATUS.ACTIVE;
        const button = createElement('button', `btn btn-${isActive ? 'secondary' : 'success'} btn-sm`, {}, {
            type: 'button',
            textContent: isActive ? 'Deactivate' : 'Activate'
        });
        
        button.addEventListener('click', () => {
            this.toggleActivation();
        });
        
        return button;
    }

    formatStatus(status) {
        const statusMap = {
            [AGENT_STATUS.ACTIVE]: 'Active',
            [AGENT_STATUS.INACTIVE]: 'Inactive',
            [AGENT_STATUS.BUSY]: 'Busy',
            [AGENT_STATUS.ERROR]: 'Error'
        };
        return statusMap[status] || status;
    }

    formatCapability(capability) {
        const capabilityMap = {
            [AGENT_CAPABILITIES.WEB_RESEARCH]: 'Web Research',
            [AGENT_CAPABILITIES.CODE_GENERATION]: 'Code Generation',
            [AGENT_CAPABILITIES.DATA_ANALYSIS]: 'Data Analysis',
            [AGENT_CAPABILITIES.CONTENT_WRITING]: 'Content Writing',
            [AGENT_CAPABILITIES.IMAGE_GENERATION]: 'Image Generation',
            [AGENT_CAPABILITIES.FILE_PROCESSING]: 'File Processing'
        };
        return capabilityMap[capability] || capability;
    }

    showMenu(button) {
        // Implement dropdown menu
        const menu = createElement('div', 'dropdown-menu');
        
        const items = [
            { label: 'Edit', action: () => this.editAgent() },
            { label: 'Duplicate', action: () => this.duplicateAgent() },
            { label: 'Export', action: () => this.exportAgent() },
            { label: 'Delete', action: () => this.deleteAgent(), destructive: true }
        ];
        
        items.forEach(item => {
            const menuItem = createElement('button', `dropdown-item ${item.destructive ? 'text-danger' : ''}`, {}, {
                type: 'button',
                textContent: item.label
            });
            
            menuItem.addEventListener('click', item.action);
            menu.appendChild(menuItem);
        });
        
        document.body.appendChild(menu);
        
        // Position menu near button
        const rect = button.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom}px`;
        menu.style.left = `${rect.left}px`;
        
        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== button) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        document.addEventListener('click', closeMenu);
    }

    openChat() {
        // Dispatch event to open chat with this agent
        const event = new CustomEvent('chat:open', {
            detail: { agentId: this.agent.id }
        });
        document.dispatchEvent(event);
    }

    toggleActivation() {
        const event = new CustomEvent('agent:toggle-activation', {
            detail: { agentId: this.agent.id, currentStatus: this.agent.status }
        });
        document.dispatchEvent(event);
    }

    editAgent() {
        const event = new CustomEvent('agent:edit', {
            detail: { agentId: this.agent.id }
        });
        document.dispatchEvent(event);
    }

    duplicateAgent() {
        const event = new CustomEvent('agent:duplicate', {
            detail: { agentId: this.agent.id }
        });
        document.dispatchEvent(event);
    }

    exportAgent() {
        const event = new CustomEvent('agent:export', {
            detail: { agentId: this.agent.id }
        });
        document.dispatchEvent(event);
    }

    deleteAgent() {
        if (confirm(`Are you sure you want to delete agent "${this.agent.name}"?`)) {
            const event = new CustomEvent('agent:delete', {
                detail: { agentId: this.agent.id }
            });
            document.dispatchEvent(event);
        }
    }

    update(agent) {
        this.agent = agent;
        this.refresh();
    }

    refresh() {
        if (this.element) {
            const newElement = this.render();
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}