import { describe, it, expect } from 'vitest';
import { swaggerSpec } from '../../src/server/swagger';

describe('Swagger Configuration', () => {
  it('should generate valid OpenAPI specification', () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec.openapi).toBe('3.0.0');
    expect(swaggerSpec.info.title).toBe('ZPan API Documentation');
    expect(swaggerSpec.info.version).toBe('1.0.0');
  });

  it('should have security schema defined', () => {
    expect(swaggerSpec.components?.securitySchemes).toBeDefined();
    expect(swaggerSpec.components?.securitySchemes?.cookieAuth).toBeDefined();
  });

  it('should have response schemas defined', () => {
    expect(swaggerSpec.components?.schemas?.ApiResponse).toBeDefined();
    expect(swaggerSpec.components?.schemas?.ApiError).toBeDefined();
  });

  it('should have API paths registered', () => {
    expect(swaggerSpec.paths).toBeDefined();
  });
});
