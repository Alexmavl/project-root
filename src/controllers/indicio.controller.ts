import { Request, Response } from 'express';
import { ejecutarSP } from '../db/db';

export async function listarIndiciosPorExpediente(req: Request, res: Response) {
  const { id } = req.params; // expediente_id
  const rows = await ejecutarSP('sp_Indicios_ListarPorExpediente', { expediente_id: id });
  res.json(rows);
}

export async function crearIndicio(req: Request, res: Response) {
  const { id } = req.params; // expediente_id
  const { codigo, descripcion, peso, color, tamano } = req.body;
  const tecnico_id = req.user!.id;
  try {
    const rows = await ejecutarSP('sp_Indicios_Crear', { expediente_id: id, codigo, descripcion, peso, color, tamano, tecnico_id });
    res.status(201).json(rows[0] ?? { ok: true });
  } catch (err: any) {
    const msg = err.message || '';
    if (msg.includes('CODIGO_DUPLICADO')) return res.status(409).json({ message: 'Código ya existe' });
    return res.status(500).json({ message: msg || 'Error creando indicio' });
  }
}

export async function actualizarIndicio(req: Request, res: Response) {
  const { id } = req.params;
  const { codigo, descripcion, peso, color, tamano } = req.body;
  const tecnico_id = req.user!.id;
  const rows = await ejecutarSP('sp_Indicios_Actualizar', { id, codigo, descripcion, peso, color, tamano, tecnico_id });
  if (!rows.length) return res.status(404).json({ message: 'No encontrado o sin permisos' });
  res.json(rows[0]);
}

export async function activarDesactivarIndicio(req: Request, res: Response) {
  const { id } = req.params;
  const { activo } = req.body;
  const rows = await ejecutarSP('sp_Indicios_ActivarDesactivar', { id, activo });
  if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
  res.json(rows[0]);
}
