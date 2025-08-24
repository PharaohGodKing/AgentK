export class SessionManager {
    constructor(sessions = [], options = {}) {
        this.sessions = sessions;
        this.options = {
            onSessionSelect: null,
            onSessionCreate: null,
            onSessionDelete: null,
            ...options
        };
    }

    render() {
        return `
            <div class="session-manager">
                <div class="session-header">
                    <h3>Chat Sessions</h3>
                    <button class="btn btn-sm btn-primary new-session-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        New Session
                    </button>
                </div>

                <div class="sessions-list">
                    ${this.sessions.length > 0 ? this.renderSessions() : this.renderNoSessions()}
                </div>
            </div>
        `;
    }

    renderSessions() {
        return this.sessions.map(session => `
            <div class="session-item ${session.active ? 'active' : ''}" data-session-id="${session.id}">
                <div class="session-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                
                <div class="session-info">
                    <h4>${session.title}</h4>
                    <p class="session-preview">${this.getSessionPreview(session)}</p>
                    <span class="session-time">${this.formatSessionTime(session)}</span>
                </div>

                <div class="session-actions">
                    <button class="btn btn-sm btn-icon delete-session-btn" title="Delete session">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderNoSessions() {
        return `
            <div class="no-sessions">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>No chat sessions yet</p>
                <p class="session-hint">Start a conversation to create your first session</p>
            </div>
        `;
    }

    getSessionPreview(session) {
        if (session.messages && session.messages.length > 0) {
            const lastMessage = session.messages[session.messages.length - 1];
            return lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
        }
        return 'No messages yet';
    }

    formatSessionTime(session) {
        if (!session.lastActivity) return '';
        
        const now = new Date();
        const lastActivity = new Date(session.lastActivity);
        const diffMs = now - lastActivity;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    }

    attachEventListeners(element) {
        const newSessionBtn = element.querySelector('.new-session-btn');
        const sessionItems = element.querySelectorAll('.session-item');
        const deleteBtns = element.querySelectorAll('.delete-session-btn');

        if (newSessionBtn) {
            newSessionBtn.addEventListener('click', () => {
                this.options.onSessionCreate?.();
            });
        }

        sessionItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.session-actions')) {
                    this.options.onSessionSelect?.(this.sessions[index]);
                }
            });
        });

        deleteBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onSessionDelete?.(this.sessions[index].id);
            });
        });
    }

    addSession(session) {
        this.sessions.unshift(session);
        this.updateView();
    }

    removeSession(sessionId) {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        this.updateView();
    }

    updateSession(sessionId, updates) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            Object.assign(session, updates);
            this.updateView();
        }
    }

    updateView() {
        const container = document.querySelector('.session-manager');
        if (container) {
            container.innerHTML = this.render();
            this.attachEventListeners(container);
        }
    }
}