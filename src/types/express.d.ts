// Extiende tipos de Express para incluir req.user
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; rol: 'tecnico' | 'coordinador'; email?: string };
    }
  }
}

export {};
