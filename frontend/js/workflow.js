import { WorkflowManager } from './services/workflow_manager.js';
import { WorkflowBuilder } from './components/WorkflowBuilder.js';

// Initialize workflow management
const workflowManager = new WorkflowManager();

// Export workflow functions
window.AgentKWorkflows = {
    init: () => workflowManager.initialize(),
    getAll: () => workflowManager.getWorkflows(),
    get: (id) => workflowManager.getWorkflow(id),
    create: (data) => workflowManager.createWorkflow(data),
    update: (id, data) => workflowManager.updateWorkflow(id, data),
    delete: (id) => workflowManager.deleteWorkflow(id),
    execute: (id, data) => workflowManager.executeWorkflow(id, data),
    renderBuilder: (workflowId, container) => {
        const builder = new WorkflowBuilder(workflowId);
        container.appendChild(builder.render());
    }
};

// Export for modules
export { workflowManager, WorkflowBuilder };