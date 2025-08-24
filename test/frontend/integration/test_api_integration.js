// API Integration Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Agents, Chat } from '../../../frontend/js/components/';
import { APIClient } from '../../../frontend/js/services/api_client';

// Mock API client
const mockAPIClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

vi.mock('../../../frontend/js/services/api_client', () => {
  return {
    APIClient: vi.fn(() => mockAPIClient)
  };
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    mockAPIClient.get.mockResolvedValue({
      data: [
        { id: 'agent1', name: 'Research Assistant', status: 'online' },
        { id: 'agent2', name: 'Coding Assistant', status: 'busy' }
      ]
    });
    
    mockAPIClient.post.mockResolvedValue({ success: true, data: {} });
  });
  
  describe('Agents API Integration', () => {
    it('should load agents from API on component mount', async () => {
      render(Agents);
      
      // Wait for API call to complete
      await waitFor(() => {
        expect(mockAPIClient.get).toHaveBeenCalledWith('/agents');
      });
      
      // Check if agents are displayed
      expect(await screen.findByText('Research Assistant')).toBeInTheDocument();
      expect(await screen.findByText('Coding Assistant')).toBeInTheDocument();
    });
    
    it('should create new agent via API', async () => {
      render(Agents);
      
      // Click add agent button
      const addButton = screen.getByText('Add New Agent');
      fireEvent.click(addButton);
      
      // Fill out form
      const nameInput = screen.getByLabelText('Agent Name');
      const descInput = screen.getByLabelText('Description');
      
      fireEvent.change(nameInput, { target: { value: 'Test Agent' } });
      fireEvent.change(descInput, { target: { value: 'A test agent' } });
      
      // Submit form
      const submitButton = screen.getByText('Create Agent');
      fireEvent.click(submitButton);
      
      // Check if API was called with correct data
      await waitFor(() => {
        expect(mockAPIClient.post).toHaveBeenCalledWith('/agents', {
          name: 'Test Agent',
          description: 'A test agent',
          capabilities: []
        });
      });
    });
  });
  
  describe('Chat API Integration', () => {
    it('should send message and receive response via API', async () => {
      // Mock the chat response
      mockAPIClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          message: 'This is a test response',
          agent: 'test-agent'
        }
      });
      
      render(Chat);
      
      // Find input and send button
      const messageInput = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByText('Send');
      
      // Type and send message
      fireEvent.change(messageInput, { target: { value: 'Hello, agent!' } });
      fireEvent.click(sendButton);
      
      // Check if API was called
      await waitFor(() => {
        expect(mockAPIClient.post).toHaveBeenCalledWith('/chat', {
          message: 'Hello, agent!',
          agent: undefined
        });
      });
      
      // Check if response is displayed
      expect(await screen.findByText('This is a test response')).toBeInTheDocument();
    });
    
    it('should handle API errors gracefully', async () => {
      // Mock an API error
      mockAPIClient.post.mockRejectedValueOnce(new Error('API error'));
      
      render(Chat);
      
      // Send message
      const messageInput = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(messageInput, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);
      
      // Should show error message
      expect(await screen.findByText(/error/i)).toBeInTheDocument();
    });
  });
});