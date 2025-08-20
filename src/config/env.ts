import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || 'info',
  jwtSecret: process.env.JWT_SECRET || 'supersecretchangeit',
  db: {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
    database: process.env.DB_NAME || 'gestiondb',
    server: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 1433),
    options: {
      encrypt: String(process.env.DB_ENCRYPT || 'true') === 'true',
      trustServerCertificate: String(process.env.DB_TRUST_CERT || 'true') === 'true'
    }
  }
};
