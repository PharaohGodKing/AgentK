import { createElement, appendChildren, formatDateTime } from '../utils/helpers.js';
import { apiClient } from '../api.js';
import { storage } from '../utils/storage.js';

export class ChatWindow {
    constructor(agentId) {
        this.agentId = agentId;
        this.agent = null;
        this.messages = [];
        this.element = null;
        this.isLoading = false;
        this.websocket = null;
    }

    async render() {
        this.element = createElement('div', 'chat-window');
        
        await this.loadAgent();
        await this.loadHistory();
        
        const header = this.createHeader();
        const messages = this.createMessagesContainer();
        const input = this.createInput();
        
        appendChildren(this.element, header, messages, input);
        this.connectWebSocket();
        
        return this.element;
    }

    async loadAgent() {
        try {
            this.agent = await apiClient.getAgent(this.agentId);
        } catch (error) {
            console.error('Failed to load agent:', error);
            // Create a placeholder agent
            this.agent = {
                id: this.agentId,
                name: 'Unknown Agent',
                description: 'Agent not found',
                status: 'error'
            };
        }
    }

    async loadHistory() {
        try {
            // Load from API
            const history = await apiClient.getChatHistory(this.agentId);
            this.messages = history;
            
            // Also load from local storage as fallback
            const localHistory = storage.getChatHistory(this.agentId);
            if (localHistory.length > this.messages.length) {
                this.messages = localHistory;
            }
            
            this.renderMessages();
        } catch (error) {
            console.error('Failed to load chat history:', error);
            // Load from local storage only
            this.messages = storage.getChatHistory(this.agentId);
            this.renderMessages();
        }
    }

    createHeader() {
        const header = createElement('div', 'chat-header');
        
        const avatar = createElement('div', 'chat-avatar');
        avatar.innerHTML = this.getAvatar();
        
        const info = createElement('div', 'chat-info');
        const name = createElement('h4', 'chat-agent-name', {}, {
            textContent: this.agent.name
        });
        const status = createElement('span', `status status-${this.agent.status}`, {}, {
            textContent: this.formatStatus(this.agent.status)
        });
        
        appendChildren(info, name, status);
        
        const actions = createElement('div', 'chat-actions');
        const closeButton = createElement('button', 'btn btn-ghost btn-sm', {}, {
            type: 'button',
            'aria-label': 'Close chat',
            innerHTML: '&times;'
        });
        
        closeButton.addEventListener('click', () => this.close());
        
        appendChildren(actions, closeButton);
        appendChildren(header, avatar, info, actions);
        
        return header;
    }

    createMessagesContainer() {
        const container = createElement('div', 'chat-messages');
        this.messagesContainer = container;
        return container;
    }

    createInput() {
        const container = createElement('div', 'chat-input-container');
        
        const input = createElement('textarea', 'chat-input', {}, {
            placeholder: 'Type your message...',
            rows: 1
        });
        
        this.input = input;
        
        input.addEventListener('input', () => {
            this.adjustInputHeight();
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        const button = createElement('button', 'btn btn-primary chat-send', {}, {
            type: 'button',
            'aria-label': 'Send message',
            innerHTML: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            `
        });
        
        button.addEventListener('click', () => this.sendMessage());
        
        appendChildren(container, input, button);
        return container;
    }

    renderMessages() {
        if (!this.messagesContainer) return;
        
        // Clear existing messages
        this.messagesContainer.innerHTML = '';
        
        // Add each message
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const isUser = message.role === 'user';
        const messageDiv = createElement('div', `chat-message ${isUser ? 'user-message' : 'agent-message'}`);
        
        const content = createElement('div', 'message-content', {}, {
            textContent: message.content
        });
        
        const time = createElement('div', 'message-time text-muted', {}, {
            textContent: formatDateTime(message.timestamp)
        });
        
        appendChildren(messageDiv, content, time);
        return messageDiv;
    }

    async sendMessage() {
        const content = this.input.value.trim();
        if (!content || this.isLoading) return;
        
        // Add user message
        const userMessage = {
            role: 'user',
            content: content,
            timestamp: new Date().toISOString()
        };
        
        this.addMessage(userMessage);
        this.input.value = '';
        this.adjustInputHeight();
        this.isLoading = true;
        
        try {
            // Send via WebSocket if available, otherwise use HTTP
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'message',
                    content: content
                }));
            } else {
                const response = await apiClient.sendMessage({
                    agentId: this.agentId,
                    message: content,
                    history: this.messages
                });
                
                this.addMessage({
                    role: 'agent',
                    content: response.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            this.addMessage({
                role: 'system',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            });
        } finally {
            this.isLoading = false;
        }
    }

    addMessage(message) {
        this.messages.push(message);
        this.renderMessages();
        
        // Save to local storage
        storage.saveChatHistory(this.agentId, this.messages);
        
        // Trigger event
        const event = new CustomEvent('chat:message', {
            detail: { agentId: this.agentId, message }
        });
        document.dispatchEvent(event);
    }

    connectWebSocket() {
        try {
            this.websocket = apiClient.createWebSocketConnection(`/chat/ws/${this.agentId}`);
            
            this.websocket.onopen = () => {
                console.log('WebSocket connection established');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.type === 'response') {
                    this.addMessage({
                        role: 'agent',
                        content: data.message,
                        timestamp: new Date().toISOString()
                    });
                    this.isLoading = false;
                } else if (data.type === 'error') {
                    this.addMessage({
                        role: 'system',
                        content: `Error: ${data.message}`,
                        timestamp: new Date().toISOString()
                    });
                    this.isLoading = false;
                }
            };
            
            this.websocket.onclose = () => {
                console.log('WebSocket connection closed');
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.warn('WebSocket connection failed:', error);
            // Continue with HTTP fallback
        }
    }

    adjustInputHeight() {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    getAvatar() {
        // Return SVG avatar based on agent name
        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const color = colors[this.agentId.charCodeAt(0) % colors.length];
        const initials = this.agent.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return `
            <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="20" fill="${color}"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="600">${initials}</text>
            </svg>
        `;
    }

    formatStatus(status) {
        const statusMap = {
            'active': 'Active',
            'inactive': 'Inactive',
            'busy': 'Busy',
            'error': 'Error'
        };
        return statusMap[status] || status;
    }

    close() {
        if (this.websocket) {
            this.websocket.close();
        }
        
        const event = new CustomEvent('chat:close', {
            detail: { agentId: this.agentId }
        });
        document.dispatchEvent(event);
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    destroy() {
        this.close();
    }
}