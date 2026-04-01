import { describe, it, expect } from 'vitest';
import {
  LoginSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserIdSchema,
  validateBody,
} from '../../src/server/schemas';

describe('Zod Schemas', () => {
  describe('LoginSchema', () => {
    it('should validate valid login data', () => {
      const validData = { username: 'test', password: 'password' };
      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing username', () => {
      const invalidData = { password: 'password' };
      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = { username: 'test' };
      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty username', () => {
      const invalidData = { username: '', password: 'password' };
      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = { username: 'test', password: '' };
      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateUserSchema', () => {
    it('should validate valid user data', () => {
      const validData = { username: 'test', password: 'password', role: 'user' };
      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate user data without role (defaulting to user)', () => {
      const validData = { username: 'test', password: 'password' };
      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidData = { username: 'test', password: 'password', role: 'invalid' };
      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateUserSchema', () => {
    it('should validate password update', () => {
      const validData = { password: 'newpassword' };
      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate role update', () => {
      const validData = { role: 'admin' };
      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate both password and role update', () => {
      const validData = { password: 'newpassword', role: 'admin' };
      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate empty update', () => {
      const validData = {};
      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidData = { role: 'invalid' };
      const result = UpdateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Middleware', () => {
    it('validateBody should return middleware function', () => {
      const middleware = validateBody(LoginSchema);
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });
  });
});
