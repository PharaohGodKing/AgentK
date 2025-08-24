// Chat E2E Tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';

describe('Chat E2E Tests', () => {
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
  
  it('should send and receive messages', async () => {
    // Navigate to chat page
    await page.click('text=Chat');
    await page.waitForSelector('text=Chat Interface');
    
    // Select an agent
    await page.selectOption('select[name="agent"]', 'research_assistant');
    
    // Send a message
    await page.fill('input[placeholder="Type your message..."]', 'Hello, can you help me with research?');
    await page.click('button:has-text("Send")');
    
    // Wait for response (mock or real depending on setup)
    await page.waitForTimeout(2000);
    
    // Check if response is displayed
    const messages = await page.$$eval('.message', elements => 
      elements.map(el => el.textContent)
    );
    
    expect(messages.length).toBeGreaterThan(1);
    expect(messages.some(msg => msg.includes('Hello, can you help me with research?'))).toBe(true);
  });
  
  it('should maintain chat history', async () => {
    // Refresh page to test persistence
    await page.reload();
    await page.waitForSelector('text=Chat Interface');
    
    // Check if previous messages are still there
    const messages = await page.$$eval('.message', elements => 
      elements.map(el => el.textContent)
    );
    
    expect(messages.length).toBeGreaterThan(0);
  });
  
  it('should clear chat history', async () => {
    // Click clear chat button
    await page.click('button:has-text("Clear Chat")');
    
    // Confirm clearance
    await page.click('button:has-text("Confirm")');
    
    // Check if chat is empty
    const messages = await page.$$eval('.message', elements => 
      elements.map(el => el.textContent)
    );
    
    expect(messages.length).toBe(0);
  });
});