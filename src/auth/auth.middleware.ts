import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from './jwt.utils';

type JwtPayload = { id: string; rol: string; email?: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] || '';
  const [type, token] = auth.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = verifyJwt<JwtPayload>(token);

    // Validar y estrechar tipo de rol
    if (!decoded?.id || !decoded?.rol || !isRole(decoded.rol)) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Ahora TS sabe que decoded.rol es 'tecnico' | 'coordinador'
    req.user = { id: decoded.id, rol: decoded.rol, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

function isRole(x: any): x is 'tecnico' | 'coordinador' {
  return x === 'tecnico' || x === 'coordinador';
}
