// Agents E2E Tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';

describe('Agents E2E Tests', () => {
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
  
  it('should create a new agent', async () => {
    // Navigate to agents page
    await page.click('text=Agents');
    await page.waitForSelector('text=Agent Management');
    
    // Click add new agent
    await page.click('button:has-text("Add New Agent")');
    
    // Fill agent details
    await page.fill('input[name="name"]', 'Test E2E Agent');
    await page.fill('textarea[name="description"]', 'An agent created for E2E testing');
    
    // Select model
    await page.selectOption('select[name="model"]', 'lm_studio');
    
    // Select capabilities
    await page.click('label:has-text("Web Research")');
    await page.click('label:has-text("Data Analysis")');
    
    // Create agent
    await page.click('button:has-text("Create Agent")');
    
    // Verify agent was created
    await page.waitForSelector('text=Agent created successfully');
    expect(await page.isVisible('text=Test E2E Agent')).toBe(true);
  });
  
  it('should edit an existing agent', async () => {
    // Find and edit the test agent
    await page.click('tr:has-text("Test E2E Agent") button:has-text("Edit")');
    
    // Update description
    await page.fill('textarea[name="description"]', 'Updated description for E2E testing');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify changes were saved
    await page.waitForSelector('text=Agent updated successfully');
    expect(await page.isVisible('text=Updated description for E2E testing')).toBe(true);
  });
  
  it('should delete an agent', async () => {
    // Find and delete the test agent
    await page.click('tr:has-text("Test E2E Agent") button:has-text("Delete")');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Verify agent was deleted
    await page.waitForSelector('text=Agent deleted successfully');
    expect(await page.isVisible('text=Test E2E Agent')).toBe(false);
  });
});