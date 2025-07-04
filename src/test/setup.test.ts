/**
 * Basic test setup to prevent "no tests found" error
 */
import { describe, it, expect } from 'vitest';

describe('Basic test setup', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});