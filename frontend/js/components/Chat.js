export class ChatView {
    constructor(agentManager) {
        this.agentManager = agentManager;
        this.container = document.getElementById('content-area');
        this.currentAgent = null;
        this.messages = [];
    }

    async show(agentId = null) {
        if (agentId) {
            this.currentAgent = this.agentManager.getAgentById(agentId);
        }
        await this.render();
        this.setupEventListeners();
    }

    hide() {
        this.container.innerHTML = '';
        this.currentAgent = null;
        this.messages = [];
    }

    async render() {
        if (!this.currentAgent) {
            this.renderAgentSelection();
            return;
        }

        this.container.innerHTML = `
            <div class="chat-view">
                <div class="card-header" style="margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="agent-avatar">${this.currentAgent.avatar || '🤖'}</div>
                        <div>
                            <h2>${this.currentAgent.name}</h2>
                            <p class="agent-desc">${this.currentAgent.description || 'AI Assistant'}</p>
                        </div>
                    </div>
                    <button class="btn btn-secondary" id="back-to-agents-btn">← Back</button>
                </div>

                <div class="chat-container">
                    <div class="chat-messages" id="chat-messages">
                        ${this.renderMessages()}
                    </div>
                    <div class="chat-input">
                        <input type="text" placeholder="Type your message..." id="chat-input">
                        <button class="btn btn-primary" id="send-message-btn">Send</button>
                    </div>
                </div>
            </div>
        `;

        this.scrollToBottom();
    }

    renderAgentSelection() {
        const agents = this.agentManager.agents || [];
        this.container.innerHTML = `
            <div class="chat-view">
                <div class="card-header">
                    <h1>Start a Conversation</h1>
                </div>
                
                <div class="dashboard-grid">
                    ${agents.map(agent => `
                        <div class="card agent-card" data-agent-id="${agent.id}">
                            <div class="card-header">
                                <div class="agent-avatar">${agent.avatar || '🤖'}</div>
                                <div class="agent-status ${agent.status || ''}"></div>
                            </div>
                            <div class="agent-info">
                                <h3 class="agent-name">${agent.name}</h3>
                                <p class="agent-desc">${agent.description || 'No description'}</p>
                                <div class="agent-meta">
                                    <span class="agent-model">Model: ${agent.model || ''}</span>
                                </div>
                            </div>
                            <button class="btn btn-primary" style="margin-top: 1rem;" data-agent-id="${agent.id}">
                                Start Chat
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderMessages() {
        if (!this.currentAgent) return '';
        if (this.messages.length === 0) {
            return `
                <div class="message system">
                    <div class="message-bubble">
                        Start a conversation with ${this.currentAgent.name}. This agent is configured to use ${this.currentAgent.model}.
                    </div>
                </div>
            `;
        }

        return this.messages.map(msg => `
            <div class="message ${msg.role}">
                <div class="message-bubble">
                    ${msg.content}
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        if (!this.currentAgent) {
            // Agent selection mode
            this.container.querySelectorAll('.agent-card, .agent-card button').forEach(element => {
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const agentId = element.dataset.agentId || (element.closest('.agent-card') && element.closest('.agent-card').dataset.agentId);
                    if (agentId) {
                        this.show(agentId);
                    }
                });
            });
            return;
        }

        // Chat mode
        const backBtn = this.container.querySelector('#back-to-agents-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.show(); // Show agent selection
            });
        }

        const sendBtn = this.container.querySelector('#send-message-btn');
        const input = this.container.querySelector('#chat-input');

        if (!sendBtn || !input) return;

        const sendMessage = async () => {
            const message = input.value.trim();
            if (!message) return;

            // Add user message
            this.addMessage('user', message);
            input.value = '';
            input.disabled = true;
            sendBtn.disabled = true;

            // Get agent response
            try {
                const response = await this.agentManager.chatWithAgent(this.currentAgent.id, message);
                this.addMessage('agent', response.content);
            } catch (error) {
                console.error('Chat error:', error);
                this.addMessage('agent', 'Sorry, I encountered an error processing your request.');
            } finally {
                input.disabled = false;
                sendBtn.disabled = false;
                input.focus();
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Focus input after rendering
        setTimeout(() => {
            input.focus();
        }, 100);
    }

    addMessage(role, content) {
        this.messages.push({ role, content, timestamp: new Date().toISOString() });
        
        // Update only the messages container instead of re-rendering everything
        const messagesContainer = this.container.querySelector('#chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = this.renderMessages();
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        const messagesContainer = this.container.querySelector('#chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    search(query) {
        // Implement search functionality for chat
        console.log('Searching chat for:', query);
        // You might want to filter and highlight messages containing the query
    }
}