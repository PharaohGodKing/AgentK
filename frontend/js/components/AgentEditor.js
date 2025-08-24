export class AgentEditor {
    constructor(agent = null, options = {}) {
        this.agent = agent || {
            id: this.generateId(),
            name: '',
            description: '',
            avatar: '🤖',
            model: '',
            capabilities: [],
            status: 'offline'
        };
        
        this.options = {
            onSave: null,
            onCancel: null,
            onTest: null,
            availableModels: [],
            ...options
        };
    }

    render() {
        return `
            <div class="agent-editor">
                <div class="editor-header">
                    <h2>${this.agent.id ? 'Edit Agent' : 'Create New Agent'}</h2>
                    <div class="header-actions">
                        <button class="btn btn-secondary" id="test-agent-btn">Test</button>
                        <button class="btn btn-primary" id="save-agent-btn">Save</button>
                        <button class="btn btn-danger" id="cancel-agent-btn">Cancel</button>
                    </div>
                </div>

                <div class="editor-content">
                    <div class="editor-sidebar">
                        <div class="agent-preview">
                            <div class="agent-avatar-preview">${this.agent.avatar}</div>
                            <h3 id="agent-name-preview">${this.agent.name || 'New Agent'}</h3>
                            <p id="agent-desc-preview">${this.agent.description || 'No description'}</p>
                        </div>
                    </div>

                    <div class="editor-main">
                        <div class="form-section">
                            <h4>Basic Information</h4>
                            <div class="form-group">
                                <label>Agent Name</label>
                                <input type="text" class="form-input" id="agent-name" 
                                       value="${this.agent.name}" placeholder="e.g., Research Assistant"
                                       oninput="this.updatePreview()">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input" id="agent-description" 
                                          placeholder="What does this agent do?"
                                          oninput="this.updatePreview()">${this.agent.description}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Avatar</label>
                                <div class="avatar-selector">
                                    ${this.renderAvatarOptions()}
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>Model Configuration</h4>
                            <div class="form-group">
                                <label>AI Model</label>
                                <select class="form-select" id="agent-model">
                                    <option value="">Select a model</option>
                                    ${this.options.availableModels.map(model => `
                                        <option value="${model.id}" ${this.agent.model === model.id ? 'selected' : ''}>
                                            ${model.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Temperature</label>
                                <input type="range" min="0" max="1" step="0.1" value="0.7"
                                       class="form-range" id="agent-temperature">
                                <span class="range-value">0.7</span>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>Capabilities</h4>
                            <div class="capabilities-grid">
                                ${this.renderCapabilityOptions()}
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>Advanced Settings</h4>
                            <div class="form-group">
                                <label>System Prompt</label>
                                <textarea class="form-input" placeholder="Custom system prompt for this agent"
                                          id="agent-system-prompt">${this.agent.systemPrompt || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Max Tokens</label>
                                <input type="number" class="form-input" value="2048" id="agent-max-tokens">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAvatarOptions() {
        const avatars = ['🤖', '👨‍💻', '👩‍💻', '🔍', '📊', '📝', '🌐', '⚡'];
        return avatars.map(avatar => `
            <label class="avatar-option ${this.agent.avatar === avatar ? 'selected' : ''}">
                <input type="radio" name="agent-avatar" value="${avatar}" 
                       ${this.agent.avatar === avatar ? 'checked' : ''}>
                <span class="avatar-emoji">${avatar}</span>
            </label>
        `).join('');
    }

    renderCapabilityOptions() {
        const capabilities = [
            { id: 'web_research', label: 'Web Research', icon: '🌐' },
            { id: 'code_generation', label: 'Code Generation', icon: '💻' },
            { id: 'data_analysis', label: 'Data Analysis', icon: '📊' },
            { id: 'content_writing', label: 'Content Writing', icon: '📝' },
            { id: 'summarization', label: 'Summarization', icon: '📋' },
            { id: 'translation', label: 'Translation', icon: '🌍' },
            { id: 'debugging', label: 'Debugging', icon: '🐛' }
        ];

        return capabilities.map(cap => `
            <label class="capability-option">
                <input type="checkbox" name="capabilities" value="${cap.id}"
                       ${this.agent.capabilities?.includes(cap.id) ? 'checked' : ''}>
                <div class="capability-card">
                    <span class="capability-icon">${cap.icon}</span>
                    <span class="capability-label">${cap.label}</span>
                </div>
            </label>
        `).join('');
    }

    attachEventListeners(element) {
        // Save button
        element.querySelector('#save-agent-btn').addEventListener('click', () => {
            this.saveAgent();
        });

        // Cancel button
        element.querySelector('#cancel-agent-btn').addEventListener('click', () => {
            this.options.onCancel?.();
        });

        // Test button
        element.querySelector('#test-agent-btn').addEventListener('click', () => {
            this.testAgent();
        });

        // Avatar selection
        element.querySelectorAll('.avatar-option input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.agent.avatar = e.target.value;
                this.updatePreview();
            });
        });

        // Real-time preview updates
        element.querySelector('#agent-name').addEventListener('input', () => {
            this.updatePreview();
        });

        element.querySelector('#agent-description').addEventListener('input', () => {
            this.updatePreview();
        });

        // Temperature slider
        const tempSlider = element.querySelector('#agent-temperature');
        const tempValue = element.querySelector('.range-value');
        
        tempSlider.addEventListener('input', () => {
            tempValue.textContent = tempSlider.value;
        });
    }

    updatePreview() {
        const name = document.getElementById('agent-name')?.value || 'New Agent';
        const description = document.getElementById('agent-description')?.value || 'No description';
        const avatar = document.querySelector('input[name="agent-avatar"]:checked')?.value || '🤖';

        const namePreview = document.getElementById('agent-name-preview');
        const descPreview = document.getElementById('agent-desc-preview');
        const avatarPreview = document.querySelector('.agent-avatar-preview');

        if (namePreview) namePreview.textContent = name;
        if (descPreview) descPreview.textContent = description;
        if (avatarPreview) avatarPreview.textContent = avatar;
    }

    saveAgent() {
        // Collect form data
        this.agent.name = document.getElementById('agent-name').value;
        this.agent.description = document.getElementById('agent-description').value;
        this.agent.model = document.getElementById('agent-model').value;
        this.agent.avatar = document.querySelector('input[name="agent-avatar"]:checked').value;
        
        // Collect capabilities
        this.agent.capabilities = Array.from(
            document.querySelectorAll('input[name="capabilities"]:checked')
        ).map(input => input.value);

        // Collect advanced settings
        this.agent.temperature = parseFloat(document.getElementById('agent-temperature').value);
        this.agent.maxTokens = parseInt(document.getElementById('agent-max-tokens').value);
        this.agent.systemPrompt = document.getElementById('agent-system-prompt').value;

        this.options.onSave?.(this.agent);
    }

    testAgent() {
        // Collect current form data for testing
        const testData = {
            name: document.getElementById('agent-name').value,
            description: document.getElementById('agent-description').value,
            model: document.getElementById('agent-model').value,
            capabilities: Array.from(
                document.querySelectorAll('input[name="capabilities"]:checked')
            ).map(input => input.value)
        };

        this.options.onTest?.(testData);
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}