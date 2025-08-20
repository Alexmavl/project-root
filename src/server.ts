import app from './app';
import { config } from './config/env';
import './db/db'; // inicializa pool

app.listen(config.port, () => {
  console.log(`🚀 API corriendo en http://localhost:${config.port}`);
  console.log(`📘 Swagger en   http://localhost:${config.port}/docs`);
});
