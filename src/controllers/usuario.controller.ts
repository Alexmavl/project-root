import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ejecutarSP } from '../db/db';

export async function crearUsuario(req: Request, res: Response) {
  try {
    const { nombre, email, rol, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const rows = await ejecutarSP('sp_Usuarios_Crear', { nombre, email, rol, password_hash });
    res.status(201).json(rows[0] ?? { ok: true });
  } catch (err: any) {
    const msg = err.message || '';
    if (msg.includes('EMAIL_EXISTS')) return res.status(409).json({ message: 'El email ya existe' });
    return res.status(500).json({ message: msg || 'Error creando usuario' });
  }
}

export async function listarUsuarios(req: Request, res: Response) {
  const { q = '', page = '1', pageSize = '10', activo } = req.query as any;

  const pageNum = Math.max(1, Number(page));
  const pageSizeNum = Math.max(1, Math.min(200, Number(pageSize)));
  const activoBit = activo === undefined ? null : (String(activo).toLowerCase() === 'true' ? 1 : 0);

  try {
    const rows = await ejecutarSP('sp_Usuarios_Listar', {
      q, page: pageNum, pageSize: pageSizeNum, activo: activoBit
    });

    const total = rows?.[0]?.total ?? 0;
    return res.json({ page: pageNum, pageSize: pageSizeNum, total, data: rows });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error listando usuarios', error: String(err?.message || '') });
  }
}