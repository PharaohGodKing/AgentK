// UI Integration Tests
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { Dashboard, Agents, Workflows } from '../../../frontend/js/components/';

// Mock the API client
vi.mock('../../../frontend/js/services/api_client', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({ success: true }),
      put: vi.fn().mockResolvedValue({ success: true }),
      delete: vi.fn().mockResolvedValue({ success: true })
    }))
  };
});

describe('UI Integration Tests', () => {
  beforeEach(() => {
    // Set up any necessary mocks or state
  });
  
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  
  describe('Dashboard', () => {
    it('should render dashboard with metrics and agent list', async () => {
      render(Dashboard);
      
      // Check for dashboard elements
      expect(screen.getByText('Collaborator System Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Active Agents')).toBeInTheDocument();
      expect(screen.getByText('Recent Tasks')).toBeInTheDocument();
      
      // Check for metrics cards
      expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
      expect(screen.getByText('Model Performance')).toBeInTheDocument();
      
      // Check for quick actions
      expect(screen.getByText('Create New Agent')).toBeInTheDocument();
      expect(screen.getByText('Design Workflow')).toBeInTheDocument();
    });
    
    it('should open create agent modal when button is clicked', async () => {
      render(Dashboard);
      
      const createButton = screen.getByText('Create New Agent');
      fireEvent.click(createButton);
      
      // Modal should be visible
      expect(screen.getByText('Create New Agent')).toBeInTheDocument();
      expect(screen.getByLabelText('Agent Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });
  
  describe('Agents Page', () => {
    it('should display agent management interface', async () => {
      render(Agents);
      
      // Check for agent management elements
      expect(screen.getByText('Agent Management')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search agents...')).toBeInTheDocument();
      expect(screen.getByText('Add New Agent')).toBeInTheDocument();
    });
    
    it('should filter agents based on search input', async () => {
      render(Agents);
      
      const searchInput = screen.getByPlaceholderText('Search agents...');
      fireEvent.change(searchInput, { target: { value: 'research' } });
      
      // Assuming we have mock agents, check if filtering works
      // This would depend on the actual implementation
    });
  });
  
  describe('Workflows Page', () => {
    it('should display workflow builder interface', async () => {
      render(Workflows);
      
      // Check for workflow management elements
      expect(screen.getByText('Workflow Builder')).toBeInTheDocument();
      expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      expect(screen.getByText('Saved Workflows')).toBeInTheDocument();
    });
    
    it('should allow creating a new workflow', async () => {
      render(Workflows);
      
      const createButton = screen.getByText('Create New Workflow');
      fireEvent.click(createButton);
      
      // Should show workflow canvas or editor
      // This would depend on the actual implementation
    });
  });
});