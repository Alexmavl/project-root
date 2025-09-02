// src/docs/swagger.ts
import path from 'path';
import fs from 'fs';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export function setupSwagger(app: Express) {
  const cwd = process.cwd();
  const src = path.join(cwd, 'src');
  const dist = path.join(cwd, 'dist');

  const apis: string[] = [
    // Desarrollo
    path.join(src, '**/*.routes.ts'),
    path.join(src, '**/*.controller.ts'),
    path.join(src, 'app.ts'),
  ];

  // Producción (archivos compilados)
  if (fs.existsSync(dist)) {
    apis.push(path.join(dist, '**/*.routes.js'));
    apis.push(path.join(dist, '**/*.controller.js'));
    apis.push(path.join(dist, 'app.js'));
  }

  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: '3.0.3',
      info: { title: 'API Expedientes e Indicios', version: '1.0.0' },
      // Usa relativo para que “Try it out” no apunte a localhost si navegas desde otra máquina
      servers: [{ url: process.env.SWAGGER_SERVER_URL || '/' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis,
  });

  app.get('/docs.json', (_req, res) => res.json(swaggerSpec)); // para debug
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
}
