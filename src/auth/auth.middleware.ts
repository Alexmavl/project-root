import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from './jwt.utils';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] || '';
  const [type, token] = auth.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'Token requerido' });
  try {
    const decoded = verifyJwt<{ id: string; rol: string; email?: string }>(token);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
