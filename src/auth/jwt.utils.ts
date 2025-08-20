import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export function signJwt(payload: object, expiresIn = '1h') {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, config.jwtSecret) as T;
}
