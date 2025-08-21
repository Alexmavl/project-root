import { Request, Response } from 'express';
import { ejecutarSP } from '../db/db';

/**
 * GET /expedientes/:codigo/indicios
 */
export async function listarIndiciosPorExpedientePorCodigo(req: Request, res: Response) {
  const { codigo } = req.params; // expediente_codigo
  const { q = '', page = '1', pageSize = '10', activo } = req.query as any;

  const pageNum = Math.max(1, Number(page));
  const pageSizeNum = Math.max(1, Math.min(200, Number(pageSize)));
  const activoBit = activo === undefined ? null : (String(activo).toLowerCase() === 'true' ? 1 : 0);

  try {
    const rows = await ejecutarSP('dbo.sp_Indicios_ListarPorExpediente', {
      expediente_codigo: (codigo ?? '').toString().trim(),
      q,
      page: pageNum,
      pageSize: pageSizeNum,
      activo: activoBit
    });
    const total = rows?.[0]?.total ?? 0;
    res.json({ page: pageNum, pageSize: pageSizeNum, total, data: rows });
  } catch (err: any) {
    res.status(500).json({ message: 'Error listando indicios', error: String(err?.message || '') });
  }
}

/**
 * POST /expedientes/:codigo/indicios
 */
export async function crearIndicioPorCodigo(req: Request, res: Response) {
  const { codigo: expediente_codigo } = req.params;
  let { codigo, descripcion, peso, color, tamano } = req.body as any;
  const tecnico_id = req.user!.id;

  // Normalización mínima
  const expedienteCodigo = (expediente_codigo ?? '').toString().trim();
  codigo = (codigo ?? '').toString().trim();
  descripcion = (descripcion ?? '').toString().trim();
  color = color ? String(color).trim() : null;
  tamano = tamano ? String(tamano).trim() : null;

  if (!expedienteCodigo) return res.status(400).json({ message: 'expediente codigo requerido' });
  if (!codigo) return res.status(400).json({ message: 'codigo requerido' });
  if (!descripcion) return res.status(400).json({ message: 'descripcion requerida' });
  if (peso === undefined || peso === null || Number(peso) < 0)
    return res.status(400).json({ message: 'peso inválido' });

  try {
    const rows = await ejecutarSP('dbo.sp_Indicios_Crear', {
      expediente_codigo: expedienteCodigo,
      codigo,
      descripcion,
      peso: Number(peso),
      color,
      tamano,
      tecnico_id
    });
    return res.status(201).json(rows?.[0] ?? { ok: true });
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('CODIGO_DUPLICADO')) return res.status(409).json({ message: 'Código ya existe' });
    if (msg.includes('NO_AUTORIZADO_O_NO_ENCONTRADO')) return res.status(403).json({ message: 'No autorizado' });
    if (msg.includes('EXPEDIENTE_NO_ENCONTRADO')) return res.status(404).json({ message: 'Expediente no encontrado' });
    return res.status(500).json({ message: 'Error creando indicio', error: msg });
  }
}

/**
 * PUT /expedientes/:codigo/indicios/:codigoIndicio
 */
export async function actualizarIndicioPorCodigo(req: Request, res: Response) {
  const { codigo: expediente_codigo, codigoIndicio } = req.params;
  let { codigo, descripcion, peso, color, tamano } = req.body as any;
  const tecnico_id = req.user!.id;

  const expedienteCodigo = (expediente_codigo ?? '').toString().trim();
  const codigo_lookup = (codigoIndicio ?? '').toString().trim();
  codigo = (codigo ?? '').toString().trim();
  descripcion = (descripcion ?? '').toString().trim();
  color = color ? String(color).trim() : null;
  tamano = tamano ? String(tamano).trim() : null;

  if (!expedienteCodigo) return res.status(400).json({ message: 'expediente codigo requerido' });
  if (!codigo_lookup) return res.status(400).json({ message: 'codigoIndicio requerido' });
  if (!codigo) return res.status(400).json({ message: 'codigo requerido' });
  if (!descripcion) return res.status(400).json({ message: 'descripcion requerida' });
  if (peso === undefined || peso === null || Number(peso) < 0)
    return res.status(400).json({ message: 'peso inválido' });

  try {
    const rows = await ejecutarSP('dbo.sp_Indicios_Actualizar', {
      expediente_codigo: expedienteCodigo,
      codigo_lookup,
      codigo,
      descripcion,
      peso: Number(peso),
      color,
      tamano,
      tecnico_id
    });
    if (!rows?.length) return res.status(404).json({ message: 'No encontrado o sin permisos' });
    return res.json(rows[0]);
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('CODIGO_DUPLICADO')) return res.status(409).json({ message: 'Código duplicado' });
    if (msg.includes('NO_AUTORIZADO_O_NO_ENCONTRADO')) return res.status(403).json({ message: 'No autorizado' });
    if (msg.includes('INDICIO_NO_ENCONTRADO')) return res.status(404).json({ message: 'Indicio no encontrado' });
    if (msg.includes('EXPEDIENTE_NO_ENCONTRADO')) return res.status(404).json({ message: 'Expediente no encontrado' });
    if (msg.includes('FALTA_ID_O_CODIGO')) return res.status(400).json({ message: 'Falta id o codigo' });
    return res.status(500).json({ message: 'Error actualizando indicio', error: msg });
  }
}

/**
 * PATCH /expedientes/:codigo/indicios/:codigoIndicio/activo
 */
export async function activarDesactivarIndicioPorCodigo(req: Request, res: Response) {
  const { codigo: expediente_codigo, codigoIndicio } = req.params;
  let { activo } = req.body as { activo: boolean | number | string };
  const tecnico_id = req.user!.id;

  const expedienteCodigo = (expediente_codigo ?? '').toString().trim();
  const codigo_lookup = (codigoIndicio ?? '').toString().trim();

  if (!expedienteCodigo) return res.status(400).json({ message: 'expediente codigo requerido' });
  if (!codigo_lookup) return res.status(400).json({ message: 'codigoIndicio requerido' });

  // normalizar activo → bit
  if (typeof activo === 'string') {
    const v = activo.toLowerCase();
    if (v === 'true' || v === '1') activo = 1;
    else if (v === 'false' || v === '0') activo = 0;
  } else if (typeof activo === 'boolean') {
    activo = activo ? 1 : 0;
  }
  if (activo !== 0 && activo !== 1) {
    return res.status(400).json({ message: 'activo debe ser boolean/0/1' });
  }

  try {
    const rows = await ejecutarSP('dbo.sp_Indicios_ActivarDesactivar', {
      expediente_codigo: expedienteCodigo,
      codigo_lookup,
      activo,
      tecnico_id
    });
    if (!rows?.length) return res.status(404).json({ message: 'No encontrado o sin permisos' });
    return res.json(rows[0]);
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('NO_AUTORIZADO_O_NO_ENCONTRADO')) return res.status(403).json({ message: 'No autorizado' });
    if (msg.includes('INDICIO_NO_ENCONTRADO')) return res.status(404).json({ message: 'Indicio no encontrado' });
    if (msg.includes('EXPEDIENTE_NO_ENCONTRADO')) return res.status(404).json({ message: 'Expediente no encontrado' });
    if (msg.includes('FALTA_ID_O_CODIGO')) return res.status(400).json({ message: 'Falta id o codigo' });
    return res.status(500).json({ message: 'Error actualizando estado', error: msg });
  }
}
