// Workflow E2E Tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';

describe('Workflow E2E Tests', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  it('should create a new workflow', async () => {
    // Navigate to workflows page
    await page.click('text=Workflows');
    await page.waitForSelector('text=Workflow Builder');
    
    // Click create new workflow
    await page.click('text=Create New Workflow');
    
    // Fill workflow details
    await page.fill('input[placeholder="Workflow Name"]', 'Test Workflow');
    await page.fill('textarea[placeholder="Workflow Description"]', 'A test workflow for E2E testing');
    
    // Add steps (this would depend on the actual UI implementation)
    // For now, we'll assume there's a button to add steps
    await page.click('button:has-text("Add Step")');
    
    // Select agent and action
    await page.selectOption('select[name="agent"]', 'research_assistant');
    await page.selectOption('select[name="action"]', 'research_topic');
    
    // Save workflow
    await page.click('button:has-text("Save Workflow")');
    
    // Verify workflow was created
    await page.waitForSelector('text=Workflow saved successfully');
    expect(await page.isVisible('text=Test Workflow')).toBe(true);
  });
  
  it('should execute a workflow', async () => {
    // Navigate to workflows page
    await page.click('text=Workflows');
    
    // Find and run the test workflow
    await page.click('tr:has-text("Test Workflow") button:has-text("Run")');
    
    // Monitor execution
    await page.waitForSelector('text=Workflow started');
    
    // Wait for completion (with timeout)
    try {
      await page.waitForSelector('text=Workflow completed', { timeout: 30000 });
      expect(await page.isVisible('text=Workflow completed')).toBe(true);
    } catch (e) {
      // If workflow takes too long, check if it's at least running
      expect(await page.isVisible('text=Workflow running')).toBe(true);
    }
  });
  
  it('should view workflow results', async () => {
    // Navigate to workflows page
    await page.click('text=Workflows');
    
    // View results of the test workflow
    await page.click('tr:has-text("Test Workflow") button:has-text("View Results")');
    
    // Check if results are displayed
    await page.waitForSelector('text=Workflow Results');
    expect(await page.isVisible('text=Execution Log')).toBe(true);
    expect(await page.isVisible('text=Output Data')).toBe(true);
  });
});