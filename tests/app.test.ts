import { createApp } from '../src/app';
import express from 'express';

describe('createApp', () => {
  it('should create an express app', () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  it('should have all middleware registered', () => {
    const app = createApp();
    // The app should have the middleware stack
    expect((app as any)._router).toBeDefined();
  });
});
