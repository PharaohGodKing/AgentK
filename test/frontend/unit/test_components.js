// Frontend Component Unit Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { AgentCard, ChatWindow, WorkflowBuilder } from '../../../frontend/js/components/';

// Mock DOM environment
beforeEach(() => {
  document.body.innerHTML = `
    <div id="test-container"></div>
  `;
});

describe('Frontend Components', () => {
  describe('AgentCard', () => {
    it('should render agent information correctly', () => {
      const agentData = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'A test agent for unit testing',
        status: 'online',
        capabilities: ['testing', 'debugging']
      };
      
      const agentCard = new AgentCard(agentData);
      const element = agentCard.render();
      
      expect(element.querySelector('.agent-name').textContent).toBe('Test Agent');
      expect(element.querySelector('.agent-description').textContent).toBe('A test agent for unit testing');
      expect(element.querySelector('.status-indicator').classList.contains('online')).toBe(true);
    });
    
    it('should emit event when clicked', () => {
      const agentData = {
        id: 'test-agent',
        name: 'Test Agent'
      };
      
      const agentCard = new AgentCard(agentData);
      let clickEventFired = false;
      
      agentCard.on('click', () => {
        clickEventFired = true;
      });
      
      const element = agentCard.render();
      element.click();
      
      expect(clickEventFired).toBe(true);
    });
  });
  
  describe('ChatWindow', () => {
    it('should display messages correctly', () => {
      const chatWindow = new ChatWindow();
      const testMessages = [
        { sender: 'user', content: 'Hello, agent!' },
        { sender: 'agent', content: 'Hello, user!' }
      ];
      
      testMessages.forEach(msg => chatWindow.addMessage(msg));
      
      const messageElements = chatWindow.container.querySelectorAll('.message');
      expect(messageElements.length).toBe(2);
      expect(messageElements[0].classList.contains('user-message')).toBe(true);
      expect(messageElements[1].classList.contains('agent-message')).toBe(true);
    });
    
    it('should clear messages when reset is called', () => {
      const chatWindow = new ChatWindow();
      chatWindow.addMessage({ sender: 'user', content: 'Test message' });
      
      expect(chatWindow.container.querySelectorAll('.message').length).toBe(1);
      chatWindow.reset();
      expect(chatWindow.container.querySelectorAll('.message').length).toBe(0);
    });
  });
  
  describe('WorkflowBuilder', () => {
    it('should create workflow nodes correctly', () => {
      const workflowBuilder = new WorkflowBuilder();
      const nodeData = {
        id: 'test-node',
        type: 'action',
        position: { x: 100, y: 100 },
        data: { action: 'test_action' }
      };
      
      const node = workflowBuilder.createNode(nodeData);
      expect(node.id).toBe('test-node');
      expect(node.type).toBe('action');
      expect(node.position).toEqual({ x: 100, y: 100 });
    });
    
    it('should validate workflow structure', () => {
      const workflowBuilder = new WorkflowBuilder();
      const validWorkflow = {
        nodes: [
          { id: 'start', type: 'trigger', position: { x: 0, y: 0 } },
          { id: 'action', type: 'action', position: { x: 100, y: 100 } }
        ],
        edges: [
          { id: 'edge-1', source: 'start', target: 'action' }
        ]
      };
      
      const invalidWorkflow = {
        nodes: [
          { id: 'start', type: 'trigger', position: { x: 0, y: 0 } }
        ],
        edges: [
          { id: 'edge-1', source: 'start', target: 'non-existent' }
        ]
      };
      
      expect(workflowBuilder.validateWorkflow(validWorkflow).valid).toBe(true);
      expect(workflowBuilder.validateWorkflow(invalidWorkflow).valid).toBe(false);
    });
  });
});