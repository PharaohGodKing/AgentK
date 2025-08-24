// Frontend Services Unit Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentManager, APIClient, NotificationService } from '../../../frontend/js/services/';

// Mock fetch API
global.fetch = vi.fn();

describe('Frontend Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  
  describe('APIClient', () => {
    it('should make successful API requests', async () => {
      const mockResponse = { data: 'test data' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });
      
      const client = new APIClient('/api');
      const response = await client.get('/test');
      
      expect(fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
      expect(response).toEqual(mockResponse);
    });
    
    it('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      const client = new APIClient('/api');
      
      await expect(client.get('/test')).rejects.toThrow('API error: 404 Not Found');
    });
    
    it('should include auth headers when token is present', async () => {
      localStorage.setItem('auth_token', 'test-token');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });
      
      const client = new APIClient('/api');
      await client.get('/test');
      
      expect(fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
  });
  
  describe('AgentManager', () => {
    it('should manage agent state correctly', () => {
      const manager = new AgentManager();
      const testAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        status: 'offline'
      };
      
      // Add agent
      manager.addAgent(testAgent);
      expect(manager.getAgent('test-agent')).toEqual(testAgent);
      expect(manager.getAllAgents().length).toBe(1);
      
      // Update agent
      manager.updateAgent('test-agent', { status: 'online' });
      expect(manager.getAgent('test-agent').status).toBe('online');
      
      // Remove agent
      manager.removeAgent('test-agent');
      expect(manager.getAgent('test-agent')).toBeUndefined();
      expect(manager.getAllAgents().length).toBe(0);
    });
    
    it('should notify observers on state changes', () => {
      const manager = new AgentManager();
      const observer = vi.fn();
      
      manager.subscribe(observer);
      manager.addAgent({ id: 'test', name: 'Test' });
      
      expect(observer).toHaveBeenCalledWith(
        'agent_added',
        expect.objectContaining({ id: 'test' })
      );
    });
  });
  
  describe('NotificationService', () => {
    it('should show notifications', () => {
      const service = new NotificationService();
      const mockShow = vi.fn();
      service.show = mockShow;
      
      service.success('Operation successful');
      expect(mockShow).toHaveBeenCalledWith(
        'success',
        'Operation successful'
      );
      
      service.error('Something went wrong');
      expect(mockShow).toHaveBeenCalledWith(
        'error',
        'Something went wrong'
      );
    });
    
    it('should handle different notification types', () => {
      const service = new NotificationService();
      const mockShow = vi.fn();
      service.show = mockShow;
      
      service.info('Information message');
      expect(mockShow).toHaveBeenCalledWith(
        'info',
        'Information message'
      );
      
      service.warning('Warning message');
      expect(mockShow).toHaveBeenCalledWith(
        'warning',
        'Warning message'
      );
    });
  });
});