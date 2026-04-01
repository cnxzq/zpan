import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

/**
 * Swagger JSDoc configuration
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZPan API Documentation',
      version: '1.0.0',
      description: 'API documentation for ZPan - A static file网盘 with authentication, file upload, and multi-user management',
    },
    servers: [
      {
        url: '/',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'zpan-session',
          description: 'Session cookie for authentication',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
          required: ['success'],
        },
        ApiError: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
          required: ['error'],
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    './src/server/routes/*.ts',
    './src/server/swagger.ts',
  ],
};

/**
 * Initialize Swagger UI middleware
 */
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Setup Swagger UI
 */
export function setupSwagger(app: Express, basePath: string = ''): void {
  // Serve Swagger JSON
  app.get(`${basePath}/api-docs.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  // Serve Swagger UI
  app.use(
    `${basePath}/api-docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'ZPan API Documentation',
    })
  );

  console.log(`📚 Swagger UI available at: ${basePath}/api-docs`);
}
