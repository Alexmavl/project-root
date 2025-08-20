import { Request, Response } from 'express';
import { ejecutarSP } from '../db/db';

export async function listarExpedientes(req: Request, res: Response) {
  const { q = '', page = '1', pageSize = '10', estado, activo } = req.query as any;
  const rows = await ejecutarSP('sp_Expedientes_Listar', {
    q, page: Number(page), pageSize: Number(pageSize), estado: estado ?? null, activo: activo ?? null
  });
  res.json(rows);
}

export async function obtenerExpediente(req: Request, res: Response) {
  const { id } = req.params;
  const rows = await ejecutarSP('sp_Expedientes_Obtener', { id });
  if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
  res.json(rows[0]);
}

export async function crearExpediente(req: Request, res: Response) {
  const { codigo, descripcion } = req.body;
  const tecnico_id = req.user!.id;
  try {
    const rows = await ejecutarSP('sp_Expedientes_Crear', { codigo, descripcion, tecnico_id });
    res.status(201).json(rows[0] ?? { ok: true });
  } catch (err: any) {
    const msg = err.message || '';
    if (msg.includes('CODIGO_DUPLICADO')) return res.status(409).json({ message: 'Código ya existe' });
    return res.status(500).json({ message: msg || 'Error creando expediente' });
  }
}

export async function actualizarExpediente(req: Request, res: Response) {
  const { id } = req.params;
  const { codigo, descripcion } = req.body;
  const tecnico_id = req.user!.id;
  const rows = await ejecutarSP('sp_Expedientes_Actualizar', { id, codigo, descripcion, tecnico_id });
  if (!rows.length) return res.status(404).json({ message: 'No encontrado o sin permisos' });
  res.json(rows[0]);
}

export async function cambiarEstadoExpediente(req: Request, res: Response) {
  const { id } = req.params;
  const { estado, justificacion } = req.body; // aprobado | rechazado
  const aprobador_id = req.user!.id;
  const rows = await ejecutarSP('sp_Expedientes_CambiarEstado', { id, estado, justificacion, aprobador_id });
  if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
  res.json(rows[0]);
}

export async function activarDesactivarExpediente(req: Request, res: Response) {
  const { id } = req.params;
  const { activo } = req.body;
  const rows = await ejecutarSP('sp_Expedientes_ActivarDesactivar', { id, activo });
  if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
  res.json(rows[0]);
}
