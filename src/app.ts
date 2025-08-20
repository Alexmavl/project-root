import express from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import helmet from 'helmet';
import { setupSwagger } from './swagger';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();
app.use(express.json());
app.use(pinoHttp());
app.use(cors());
app.use(helmet());

setupSwagger(app);

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Enrutar API
app.use('/', routes);

// Error handler central
app.use(errorHandler);

export default app;
