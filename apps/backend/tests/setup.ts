import { vi } from 'vitest';

// Global test setup
vi.mock('sharp', () => {
  return {
    default: {
      // Mock sharp for thumbnail tests
    },
  };
});
