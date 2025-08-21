// src/docs/swagger.ts
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export function setupSwagger(app: Express) {
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: '3.0.3',
      info: { title: 'API Expedientes e Indicios', version: '1.0.0' },
      servers: [{ url: 'http://localhost:3000' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }], // lock por defecto
    },
    apis: [
      path.resolve(process.cwd(), 'src/**/*.routes.{ts,js}'),
      path.resolve(process.cwd(), 'src/app.{ts,js}'),
    ],
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
}
