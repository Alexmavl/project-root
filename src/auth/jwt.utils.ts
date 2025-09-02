import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const SECRET: jwt.Secret = config.jwtSecret;

// ✅ Firma de tokens con expiración
export function signJwt(
  payload: jwt.JwtPayload | string,
  options?: jwt.SignOptions
) {
  return jwt.sign(payload, SECRET, {
    ...options,
    expiresIn: '10m', // ⏳ Access token dura 10 minutos
    issuer: 'expedientes-api', // identifica a tu servicio
    audience: 'expedientes-frontend', // quién consume el token
  });
}

// ✅ Verificación de tokens
export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, SECRET, {
    clockTolerance: 60, // tolerancia de 60s por desfase de reloj
  }) as T;
}
