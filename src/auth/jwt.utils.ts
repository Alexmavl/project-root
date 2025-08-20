import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const SECRET: jwt.Secret = config.jwtSecret;

export function signJwt(
  payload: jwt.JwtPayload | string,
  options?: jwt.SignOptions
) {
  return jwt.sign(payload, SECRET, options);
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}
