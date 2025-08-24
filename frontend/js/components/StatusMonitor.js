import { createElement, appendChildren } from '../utils/helpers.js';
import { apiClient } from '../api.js';

export class StatusMonitor {
    constructor() {
        this.element = null;
        this.stats = null;
        this.updateInterval = null;
    }

    async render() {
        this.element = createElement('div', 'status-monitor');
        
        await this.loadStats();
        
        const header = this.createHeader();
        const content = this.createContent();
        
        appendChildren(this.element, header, content);
        this.startAutoUpdate();
        
        return this.element;
    }

    async loadStats() {
        try {
            const status = await apiClient.getSystemStatus();
            const metrics = await apiClient.getSystemMetrics();
            this.stats = { ...status, metrics };
        } catch (error) {
            console.error('Failed to load system stats:', error);
            this.stats = null;
        }
    }

    createHeader() {
        const header = createElement('div', 'status-header');
        
        const title = createElement('h1', {}, {
            textContent: 'System Status'
        });
        
        const refreshButton = createElement('button', 'btn btn-secondary', {
            textContent: 'Refresh'
        });
        
        refreshButton.addEventListener('click', () => this.refreshStats());
        
        appendChildren(header, title, refreshButton);
        return header;
    }

    createContent() {
        const content = createElement('div', 'status-content');
        
        if (!this.stats) {
            const error = createElement('div', 'alert alert-error', {
                textContent: 'Failed to load system status'
            });
            content.appendChild(error);
            return content;
        }
        
        // System health
        const health = this.createHealthStatus();
        content.appendChild(health);
        
        // Resource usage
        const resources = this.createResourceUsage();
        content.appendChild(resources);
        
        // Services status
        const services = this.createServicesStatus();
        content.appendChild(services);
        
        // Detailed metrics
        const metrics = this.createDetailedMetrics();
        content.appendChild(metrics);
        
        return content;
    }

    createHealthStatus() {
        const container = createElement('div', 'status-section');
        
        const title = createElement('h2', {}, {
            textContent: 'System Health'
        });
        
        const health = this.getSystemHealth();
        const status = createElement('div', `health-status health-${health.status}`, {
            textContent: health.message
        });
        
        appendChildren(container, title, status);
        return container;
    }

    createResourceUsage() {
        const container = createElement('div', 'status-section');
        
        const title = createElement('h2', {}, {
            textContent: 'Resource Usage'
        });
        
        const grid = createElement('div', 'resource-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4');
        
        const resources = [
            {
                name: 'CPU',
                value: this.stats.resources?.cpu_percent || 0,
                max: 100,
                unit: '%'
            },
            {
                name: 'Memory',
                value: this.stats.resources?.memory_percent || 0,
                max: 100,
                unit: '%'
            },
            {
                name: 'Disk',
                value: this.stats.resources?.disk_percent || 0,
                max: 100,
                unit: '%'
            },
            {
                name: 'Network',
                value: 0, // Would come from metrics
                max: 1000,
                unit: 'MB/s'
            }
        ];
        
        resources.forEach(resource => {
            const card = this.createResourceCard(resource);
            grid.appendChild(card);
        });
        
        appendChildren(container, title, grid);
        return container;
    }

    createResourceCard(resource) {
        const card = createElement('div', 'card resource-card');
        
        const title = createElement('h3', 'resource-title', {
            textContent: resource.name
        });
        
        const value = createElement('div', 'resource-value', {
            textContent: `${resource.value}${resource.unit}`
        });
        
        const progress = createElement('div', 'progress');
        const progressBar = createElement('div', 'progress-bar');
        
        const percentage = Math.min((resource.value / resource.max) * 100, 100);
        progressBar.style.width = `${percentage}%`;
        
        progress.appendChild(progressBar);
        appendChildren(card, title, value, progress);
        return card;
    }

    createServicesStatus() {
        const container = createElement('div', 'status-section');
        
        const title = createElement('h2', {}, {
            textContent: 'Services'
        });
        
        const list = createElement('div', 'services-list');
        
        const services = [
            { name: 'API Server', status: 'healthy' },
            { name: 'Database', status: this.stats.services?.database || 'unknown' },
            { name: 'LLM Connection', status: this.stats.services?.llm_connection || 'unknown' },
            { name: 'Memory Store', status: this.stats.services?.memory_store || 'unknown' }
        ];
        
        services.forEach(service => {
            const item = this.createServiceItem(service);
            list.appendChild(item);
        });
        
        appendChildren(container, title, list);
        return container;
    }

    createServiceItem(service) {
        const item = createElement('div', 'service-item');
        
        const name = createElement('span', 'service-name', {
            textContent: service.name
        });
        
        const status = createElement('span', `service-status status-${service.status}`, {
            textContent: service.status
        });
        
        appendChildren(item, name, status);
        return item;
    }

    createDetailedMetrics() {
        const container = createElement('div', 'status-section');
        
        const title = createElement('h2', {}, {
            textContent: 'Detailed Metrics'
        });
        
        const table = createElement('table', 'metrics-table');
        const tbody = createElement('tbody');
        
        const metrics = [
            { name: 'Uptime', value: this.formatUptime(this.stats.system?.uptime) },
            { name: 'Active Agents', value: this.stats.system?.active_agents || 0 },
            { name: 'Total Requests', value: this.stats.system?.total_requests || 0 },
            { name: 'Memory Used', value: this.formatBytes(this.stats.resources?.memory_used || 0) },
            { name: 'Memory Total', value: this.formatBytes(this.stats.resources?.memory_total || 0) },
            { name: 'Disk Used', value: this.formatBytes(this.stats.resources?.disk_used || 0) },
            { name: 'Disk Total', value: this.formatBytes(this.stats.resources?.disk_total || 0) }
        ];
        
        metrics.forEach(metric => {
            const row = createElement('tr');
            const nameCell = createElement('td', 'metric-name', {
                textContent: metric.name
            });
            
            const valueCell = createElement('td', 'metric-value', {
                textContent: metric.value
            });
            
            appendChildren(row, nameCell, valueCell);
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
        return container;
    }

    getSystemHealth() {
        if (!this.stats?.resources) {
            return { status: 'unknown', message: 'Unknown' };
        }
        
        const { cpu_percent, memory_percent, disk_percent } = this.stats.resources;
        
        if (cpu_percent > 90 || memory_percent > 90 || disk_percent > 90) {
            return { status: 'critical', message: 'Critical' };
        } else if (cpu_percent > 70 || memory_percent > 70 || disk_percent > 70) {
            return { status: 'warning', message: 'Warning' };
        } else {
            return { status: 'healthy', message: 'Healthy' };
        }
    }

    formatUptime(seconds) {
        if (!seconds) return '0s';
        
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            this.refreshStats();
        }, 30000); // Update every 30 seconds
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    async refreshStats() {
        await this.loadStats();
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.element) return;
        
        const newContent = this.createContent();
        const oldContent = this.element.querySelector('.status-content');
        
        if (oldContent && newContent) {
            oldContent.parentNode.replaceChild(newContent, oldContent);
        }
    }

    destroy() {
        this.stopAutoUpdate();
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}