import { createElement, appendChildren } from '../utils/helpers.js';

export class WorkflowBuilder {
    constructor(workflowId = null) {
        this.workflowId = workflowId;
        this.workflow = null;
        this.element = null;
        this.canvas = null;
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedNode = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    async render() {
        this.element = createElement('div', 'workflow-builder');
        
        await this.loadWorkflow();
        
        const header = this.createHeader();
        const toolbar = this.createToolbar();
        const canvas = this.createCanvas();
        const properties = this.createPropertiesPanel();
        
        appendChildren(this.element, header, toolbar, canvas, properties);
        this.setupEventListeners();
        
        return this.element;
    }

    async loadWorkflow() {
        if (this.workflowId) {
            try {
                this.workflow = await apiClient.getWorkflow(this.workflowId);
                this.renderWorkflow();
            } catch (error) {
                console.error('Failed to load workflow:', error);
                this.workflow = this.createEmptyWorkflow();
            }
        } else {
            this.workflow = this.createEmptyWorkflow();
        }
    }

    createEmptyWorkflow() {
        return {
            id: `workflow-${Date.now()}`,
            name: 'New Workflow',
            description: '',
            nodes: [],
            connections: [],
            config: {},
            status: 'draft'
        };
    }

    createHeader() {
        const header = createElement('div', 'workflow-header');
        
        const titleInput = createElement('input', 'workflow-title', {
            type: 'text',
            placeholder: 'Workflow Name',
            value: this.workflow.name
        });
        
        titleInput.addEventListener('change', (e) => {
            this.workflow.name = e.target.value;
        });
        
        const actions = createElement('div', 'workflow-actions');
        const saveButton = createElement('button', 'btn btn-primary', {
            textContent: 'Save'
        });
        
        saveButton.addEventListener('click', () => this.saveWorkflow());
        
        appendChildren(actions, saveButton);
        appendChildren(header, titleInput, actions);
        
        return header;
    }

    createToolbar() {
        const toolbar = createElement('div', 'workflow-toolbar');
        
        const nodeTypes = [
            { type: 'start', label: 'Start', icon: '▶️' },
            { type: 'agent', label: 'Agent', icon: '🤖' },
            { type: 'condition', label: 'Condition', icon: '❓' },
            { type: 'action', label: 'Action', icon: '⚡' },
            { type: 'end', label: 'End', icon: '⏹️' }
        ];
        
        nodeTypes.forEach(nodeType => {
            const button = createElement('button', 'btn btn-secondary', {
                textContent: `${nodeType.icon} ${nodeType.label}`
            });
            
            button.addEventListener('click', () => {
                this.addNode(nodeType.type);
            });
            
            toolbar.appendChild(button);
        });
        
        return toolbar;
    }

    createCanvas() {
        const canvas = createElement('div', 'workflow-canvas');
        this.canvas = canvas;
        return canvas;
    }

    createPropertiesPanel() {
        const panel = createElement('div', 'workflow-properties');
        this.propertiesPanel = panel;
        return panel;
    }

    renderWorkflow() {
        if (!this.canvas) return;
        
        // Clear canvas
        this.canvas.innerHTML = '';
        this.nodes.clear();
        this.connections.clear();
        
        // Render nodes
        this.workflow.nodes.forEach(nodeData => {
            const node = this.createNodeElement(nodeData);
            this.canvas.appendChild(node);
            this.nodes.set(nodeData.id, { element: node, data: nodeData });
        });
        
        // Render connections
        this.workflow.connections.forEach(connection => {
            this.createConnection(connection);
        });
    }

    createNodeElement(nodeData) {
        const node = createElement('div', `workflow-node node-${nodeData.type}`);
        node.style.left = `${nodeData.position.x}px`;
        node.style.top = `${nodeData.position.y}px`;
        node.dataset.nodeId = nodeData.id;
        
        const header = createElement('div', 'node-header');
        const title = createElement('div', 'node-title', {
            textContent: this.getNodeTitle(nodeData)
        });
        
        const content = createElement('div', 'node-content');
        const description = createElement('div', 'node-description', {
            textContent: this.getNodeDescription(nodeData)
        });
        
        appendChildren(header, title);
        appendChildren(content, description);
        appendChildren(node, header, content);
        
        // Add connection points
        if (nodeData.type !== 'end') {
            const output = createElement('div', 'node-output');
            node.appendChild(output);
        }
        
        if (nodeData.type !== 'start') {
            const input = createElement('div', 'node-input');
            node.appendChild(input);
        }
        
        this.setupNodeEvents(node);
        return node;
    }

    getNodeTitle(nodeData) {
        const titles = {
            'start': 'Start',
            'agent': nodeData.config.agentId ? `Agent: ${nodeData.config.agentId}` : 'Agent',
            'condition': 'Condition',
            'action': 'Action',
            'end': 'End'
        };
        return titles[nodeData.type] || nodeData.type;
    }

    getNodeDescription(nodeData) {
        const descriptions = {
            'start': 'Workflow starting point',
            'agent': nodeData.config.description || 'AI agent task',
            'condition': nodeData.config.condition || 'Decision point',
            'action': nodeData.config.action || 'Custom action',
            'end': 'Workflow completion'
        };
        return descriptions[nodeData.type] || '';
    }

    setupNodeEvents(node) {
        // Drag handling
        node.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node-input, .node-output')) return;
            
            this.selectedNode = node;
            this.isDragging = true;
            this.dragOffset = {
                x: e.clientX - node.offsetLeft,
                y: e.clientY - node.offsetTop
            };
            
            node.classList.add('dragging');
        });
        
        // Click handling
        node.addEventListener('click', (e) => {
            if (e.target.closest('.node-input, .node-output')) return;
            this.selectNode(node.dataset.nodeId);
        });
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.selectedNode) {
                const x = e.clientX - this.dragOffset.x;
                const y = e.clientY - this.dragOffset.y;
                
                this.selectedNode.style.left = `${x}px`;
                this.selectedNode.style.top = `${y}px`;
                
                // Update node data position
                const nodeId = this.selectedNode.dataset.nodeId;
                const node = this.nodes.get(nodeId);
                if (node) {
                    node.data.position = { x, y };
                }
                
                // Update connections
                this.updateConnections();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.isDragging && this.selectedNode) {
                this.selectedNode.classList.remove('dragging');
                this.isDragging = false;
                this.selectedNode = null;
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            if (this.isDragging && this.selectedNode) {
                this.selectedNode.classList.remove('dragging');
                this.isDragging = false;
                this.selectedNode = null;
            }
        });
        
        // Connection handling
        this.canvas.addEventListener('mousedown', (e) => {
            const output = e.target.closest('.node-output');
            if (output) {
                this.startConnection(output.closest('[data-node-id]').dataset.nodeId);
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            const input = e.target.closest('.node-input');
            if (input && this.connectingFrom) {
                this.completeConnection(input.closest('[data-node-id]').dataset.nodeId);
            }
        });
    }

    addNode(type) {
        const nodeId = `node-${Date.now()}`;
        const nodeData = {
            id: nodeId,
            type: type,
            position: { x: 100, y: 100 },
            config: {}
        };
        
        const node = this.createNodeElement(nodeData);
        this.canvas.appendChild(node);
        this.nodes.set(nodeId, { element: node, data: nodeData });
        this.workflow.nodes.push(nodeData);
        
        this.selectNode(nodeId);
    }

    selectNode(nodeId) {
        // Deselect previous node
        if (this.selectedNode) {
            this.selectedNode.classList.remove('selected');
        }
        
        // Select new node
        const node = this.nodes.get(nodeId);
        if (node) {
            node.element.classList.add('selected');
            this.selectedNode = node.element;
            this.showNodeProperties(node.data);
        } else {
            this.hideProperties();
        }
    }

    showNodeProperties(nodeData) {
        this.propertiesPanel.innerHTML = '';
        
        const title = createElement('h3', {}, {
            textContent: `Node: ${this.getNodeTitle(nodeData)}`
        });
        
        const form = createElement('form', 'node-properties-form');
        
        // Add properties based on node type
        switch (nodeData.type) {
            case 'agent':
                this.addAgentProperties(form, nodeData);
                break;
            case 'condition':
                this.addConditionProperties(form, nodeData);
                break;
            case 'action':
                this.addActionProperties(form, nodeData);
                break;
        }
        
        const saveButton = createElement('button', 'btn btn-primary', {
            type: 'submit',
            textContent: 'Save Properties'
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNodeProperties(nodeData, new FormData(form));
        });
        
        appendChildren(form, saveButton);
        appendChildren(this.propertiesPanel, title, form);
    }

    addAgentProperties(form, nodeData) {
        // Add agent selection
        const group = createElement('div', 'form-group');
        const label = createElement('label', 'form-label', {
            textContent: 'Select Agent',
            htmlFor: 'agent-select'
        });
        
        const select = createElement('select', 'form-select', {
            id: 'agent-select',
            name: 'agentId',
            value: nodeData.config.agentId || ''
        });
        
        // TODO: Load available agents
        const option = createElement('option', {
            value: '',
            textContent: 'Select an agent'
        });
        select.appendChild(option);
        
        appendChildren(group, label, select);
        form.appendChild(group);
    }

    addConditionProperties(form, nodeData) {
        // Add condition configuration
        const group = createElement('div', 'form-group');
        const label = createElement('label', 'form-label', {
            textContent: 'Condition Expression',
            htmlFor: 'condition-expression'
        });
        
        const input = createElement('input', 'form-input', {
            type: 'text',
            id: 'condition-expression',
            name: 'condition',
            value: nodeData.config.condition || '',
            placeholder: 'e.g., input.score > 0.5'
        });
        
        appendChildren(group, label, input);
        form.appendChild(group);
    }

    addActionProperties(form, nodeData) {
        // Add action configuration
        const group = createElement('div', 'form-group');
        const label = createElement('label', 'form-label', {
            textContent: 'Action Type',
            htmlFor: 'action-type'
        });
        
        const select = createElement('select', 'form-select', {
            id: 'action-type',
            name: 'actionType',
            value: nodeData.config.actionType || ''
        });
        
        const options = [
            { value: 'log', text: 'Log Message' },
            { value: 'api', text: 'API Call' },
            { value: 'script', text: 'Run Script' }
        ];
        
        options.forEach(opt => {
            const option = createElement('option', {
                value: opt.value,
                textContent: opt.text
            });
            select.appendChild(option);
        });
        
        appendChildren(group, label, select);
        form.appendChild(group);
    }

    hideProperties() {
        this.propertiesPanel.innerHTML = '';
    }

    saveNodeProperties(nodeData, formData) {
        const config = {};
        for (const [key, value] of formData.entries()) {
            config[key] = value;
        }
        
        nodeData.config = config;
        
        // Update node display
        const node = this.nodes.get(nodeData.id);
        if (node) {
            const title = node.element.querySelector('.node-title');
            const description = node.element.querySelector('.node-description');
            
            if (title) title.textContent = this.getNodeTitle(nodeData);
            if (description) description.textContent = this.getNodeDescription(nodeData);
        }
    }

    startConnection(fromNodeId) {
        this.connectingFrom = fromNodeId;
        this.canvas.classList.add('connecting');
    }

    completeConnection(toNodeId) {
        if (!this.connectingFrom) return;
        
        const connection = {
            from: this.connectingFrom,
            to: toNodeId
        };
        
        this.createConnection(connection);
        this.workflow.connections.push(connection);
        
        this.connectingFrom = null;
        this.canvas.classList.remove('connecting');
    }

    createConnection(connection) {
        const fromNode = this.nodes.get(connection.from);
        const toNode = this.nodes.get(connection.to);
        
        if (!fromNode || !toNode) return;
        
        const connectionId = `conn-${connection.from}-${connection.to}`;
        const line = createElement('div', 'workflow-connection');
        line.dataset.connectionId = connectionId;
        
        this.updateConnectionPosition(line, fromNode.element, toNode.element);
        this.canvas.appendChild(line);
        
        this.connections.set(connectionId, { element: line, data: connection });
    }

    updateConnectionPosition(line, fromElement, toElement) {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const fromX = fromRect.left + fromRect.width - canvasRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - canvasRect.top;
        const toX = toRect.left - canvasRect.left;
        const toY = toRect.top + toRect.height / 2 - canvasRect.top;
        
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.left = `${fromX}px`;
        line.style.top = `${fromY}px`;
        line.style.transform = `rotate(${angle}deg)`;
    }

    updateConnections() {
        this.connections.forEach((connection, id) => {
            const fromNode = this.nodes.get(connection.data.from);
            const toNode = this.nodes.get(connection.data.to);
            
            if (fromNode && toNode) {
                this.updateConnectionPosition(connection.element, fromNode.element, toNode.element);
            }
        });
    }

    async saveWorkflow() {
        try {
            if (this.workflowId) {
                this.workflow = await apiClient.updateWorkflow(this.workflowId, this.workflow);
            } else {
                this.workflow = await apiClient.createWorkflow(this.workflow);
                this.workflowId = this.workflow.id;
            }
            
            notificationService.success('Workflow saved successfully');
        } catch (error) {
            console.error('Failed to save workflow:', error);
            notificationService.error('Failed to save workflow');
        }
    }

    destroy() {
        // Cleanup event listeners
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}