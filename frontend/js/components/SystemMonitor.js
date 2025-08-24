export class SystemMonitor {
    constructor(options = {}) {
        this.options = {
            onResourceRefresh: null,
            onLogsRefresh: null,
            onSettingsUpdate: null,
            ...options
        };

        this.stats = {
            cpu: 0,
            memory: 0,
            disk: 0,
            network: 0,
            processes: []
        };

        this.logs = [];
    }

    render() {
        return `
            <div class="system-monitor">
                <div class="monitor-tabs">
                    <button class="tab-btn active" data-tab="resources">Resources</button>
                    <button class="tab-btn" data-tab="processes">Processes</button>
                    <button class="tab-btn" data-tab="logs">Logs</button>
                    <button class="tab-btn" data-tab="settings">Settings</button>
                </div>

                <div class="monitor-content">
                    <div class="tab-content active" data-tab="resources">
                        ${this.renderResourcesTab()}
                    </div>
                    
                    <div class="tab-content" data-tab="processes">
                        ${this.renderProcessesTab()}
                    </div>
                    
                    <div class="tab-content" data-tab="logs">
                        ${this.renderLogsTab()}
                    </div>
                    
                    <div class="tab-content" data-tab="settings">
                        ${this.renderSettingsTab()}
                    </div>
                </div>
            </div>
        `;
    }

    renderResourcesTab() {
        return `
            <div class="resources-grid">
                <div class="resource-card">
                    <h4>CPU Usage</h4>
                    <div class="resource-value">${this.stats.cpu}%</div>
                    <div class="resource-graph">
                        <div class="graph-bar" style="width: ${this.stats.cpu}%"></div>
                    </div>
                </div>

                <div class="resource-card">
                    <h4>Memory Usage</h4>
                    <div class="resource-value">${this.stats.memory}%</div>
                    <div class="resource-graph">
                        <div class="graph-bar" style="width: ${this.stats.memory}%"></div>
                    </div>
                </div>

                <div class="resource-card">
                    <h4>Disk Usage</h4>
                    <div class="resource-value">${this.stats.disk}%</div>
                    <div class="resource-graph">
                        <div class="graph-bar" style="width: ${this.stats.disk}%"></div>
                    </div>
                </div>

                <div class="resource-card">
                    <h4>Network</h4>
                    <div class="resource-value">${this.stats.network} Mbps</div>
                    <div class="resource-graph">
                        <div class="graph-bar" style="width: ${Math.min(this.stats.network / 1000 * 100, 100)}%"></div>
                    </div>
                </div>
            </div>

            <div class="monitor-actions">
                <button class="btn btn-primary refresh-btn">Refresh</button>
                <button class="btn btn-secondary export-btn">Export Report</button>
            </div>
        `;
    }

    renderProcessesTab() {
        return `
            <div class="processes-list">
                <table>
                    <thead>
                        <tr>
                            <th>Process</th>
                            <th>CPU</th>
                            <th>Memory</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.stats.processes.map(process => `
                            <tr>
                                <td>${process.name}</td>
                                <td>${process.cpu}%</td>
                                <td>${process.memory}MB</td>
                                <td><span class="status-badge ${process.status}">${process.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-icon" title="Restart">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M23 4v6h-6M1 20v-6h6"/>
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderLogsTab() {
        return `
            <div class="logs-container">
                <div class="logs-header">
                    <h4>System Logs</h4>
                    <div class="log-filters">
                        <select class="log-level-filter">
                            <option value="all">All Levels</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                </div>

                <div class="logs-list">
                    ${this.logs.slice(-50).map(log => `
                        <div class="log-entry log-${log.level}">
                            <span class="log-time">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span class="log-level">${log.level.toUpperCase()}</span>
                            <span class="log-message">${log.message}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="logs-actions">
                    <button class="btn btn-sm btn-secondary clear-logs-btn">Clear Logs</button>
                    <button class="btn btn-sm btn-primary refresh-logs-btn">Refresh</button>
                </div>
            </div>
        `;
    }

    renderSettingsTab() {
        return `
            <div class="settings-form">
                <div class="form-group">
                    <label>Monitoring Interval</label>
                    <select class="interval-select">
                        <option value="1000">1 second</option>
                        <option value="5000" selected>5 seconds</option>
                        <option value="10000">10 seconds</option>
                        <option value="30000">30 seconds</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" class="auto-refresh-toggle" checked>
                        Auto Refresh
                    </label>
                </div>

                <div class="form-group">
                    <label>Log Retention</label>
                    <select class="log-retention-select">
                        <option value="1000">1000 entries</option>
                        <option value="5000">5000 entries</option>
                        <option value="10000">10000 entries</option>
                        <option value="0">Unlimited</option>
                    </select>
                </div>

                <button class="btn btn-primary save-settings-btn">Save Settings</button>
            </div>
        `;
    }

    attachEventListeners(element) {
        // Tab switching
        const tabButtons = element.querySelectorAll('.tab-btn');
        const tabContents = element.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                element.querySelector(`.tab-content[data-tab="${tab}"]`).classList.add('active');
            });
        });

        // Refresh buttons
        const refreshBtn = element.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.options.onResourceRefresh?.();
            });
        }

        const refreshLogsBtn = element.querySelector('.refresh-logs-btn');
        if (refreshLogsBtn) {
            refreshLogsBtn.addEventListener('click', () => {
                this.options.onLogsRefresh?.();
            });
        }

        // Settings form
        const saveSettingsBtn = element.querySelector('.save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                const settings = {
                    interval: element.querySelector('.interval-select').value,
                    autoRefresh: element.querySelector('.auto-refresh-toggle').checked,
                    logRetention: element.querySelector('.log-retention-select').value
                };
                this.options.onSettingsUpdate?.(settings);
            });
        }
    }

    updateStats(newStats) {
        this.stats = { ...this.stats, ...newStats };
        this.updateResourcesView();
    }

    addLog(log) {
        this.logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            ...log
        });
        this.updateLogsView();
    }

    updateResourcesView() {
        const container = document.querySelector('.resources-grid');
        if (container) {
            const metrics = ['cpu', 'memory', 'disk', 'network'];
            metrics.forEach((metric, index) => {
                const valueElement = container.querySelector(`.resource-value:nth-child(${index * 2 + 2})`);
                const graphElement = container.querySelector(`.graph-bar:nth-child(${index * 2 + 3})`);
                
                if (valueElement) {
                    valueElement.textContent = `${this.stats[metric]}%`;
                }
                if (graphElement) {
                    graphElement.style.width = `${this.stats[metric]}%`;
                }
            });
        }
    }

    updateLogsView() {
        const logsContainer = document.querySelector('.logs-list');
        if (logsContainer) {
            logsContainer.innerHTML = this.logs.slice(-50).map(log => `
                <div class="log-entry log-${log.level}">
                    <span class="log-time">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span class="log-level">${log.level.toUpperCase()}</span>
                    <span class="log-message">${log.message}</span>
                </div>
            `).join('');
            
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
    }
}