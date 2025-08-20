import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ejecutarSP } from '../db/db';
import { signJwt } from '../auth/jwt.utils';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const rows = await ejecutarSP('sp_Usuarios_Login', { email });
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = signJwt({ id: user.id, rol: user.rol, email: user.email });
    res.json({ token, usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
