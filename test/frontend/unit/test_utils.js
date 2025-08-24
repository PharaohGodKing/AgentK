// Utility Functions Unit Tests
import { describe, it, expect } from 'vitest';
import { 
  formatTimestamp, 
  debounce, 
  deepClone, 
  validateEmail,
  generateId 
} from '../../../frontend/js/utils/helpers.js';

describe('Utility Functions', () => {
  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const timestamp = new Date('2023-11-15T10:30:00Z');
      const formatted = formatTimestamp(timestamp);
      
      // Format might vary based on implementation, but should contain time elements
      expect(formatted).toMatch(/\d{1,2}:/); // Contains time
      expect(formatted).toMatch(/2023/); // Contains year
    });
    
    it('should handle relative time format', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const formatted = formatTimestamp(fiveMinutesAgo, true);
      
      expect(formatted).toBe('5 minutes ago');
    });
  });
  
  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const testFunction = () => { callCount++; };
      const debouncedFunction = debounce(testFunction, 100);
      
      // Call multiple times quickly
      debouncedFunction();
      debouncedFunction();
      debouncedFunction();
      
      // Should not be called immediately
      expect(callCount).toBe(0);
      
      // Wait for debounce time
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be called exactly once
      expect(callCount).toBe(1);
    });
  });
  
  describe('deepClone', () => {
    it('should create a deep clone of an object', () => {
      const original = { 
        a: 1, 
        b: { 
          c: 2, 
          d: [3, 4, { e: 5 }] 
        } 
      };
      
      const cloned = deepClone(original);
      
      // Should have same values
      expect(cloned).toEqual(original);
      
      // Should be different objects
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
      expect(cloned.b.d[2]).not.toBe(original.b.d[2]);
      
      // Modifying clone should not affect original
      cloned.a = 10;
      cloned.b.c = 20;
      cloned.b.d[0] = 30;
      
      expect(original.a).toBe(1);
      expect(original.b.c).toBe(2);
      expect(original.b.d[0]).toBe(3);
    });
  });
  
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('first.last@subdomain.example.org')).toBe(true);
    });
    
    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@domain')).toBe(false);
    });
  });
  
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
    
    it('should generate IDs with optional prefix', () => {
      const id = generateId('test');
      expect(id.startsWith('test_')).toBe(true);
    });
  });
});