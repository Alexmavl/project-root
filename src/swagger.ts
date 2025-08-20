import swaggerJSDoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export function setupSwagger(app: Express) {
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: '3.0.3',
      info: { title: 'API Expedientes e Indicios', version: '1.0.0' },
      servers: [ { url: 'http://localhost:3000' } ]
    },
    apis: [ 'src/**/*.routes.ts', 'src/app.ts' ]
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
