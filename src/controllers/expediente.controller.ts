import { Request, Response } from 'express';
import { ejecutarSP } from '../db/db';

export async function listarExpedientes(req: Request, res: Response) {
  const { q = '', page = '1', pageSize = '10', estado, activo } = req.query as any;

  const pageNum = Math.max(1, Number(page));
  const pageSizeNum = Math.max(1, Math.min(200, Number(pageSize)));
  const activoBit = activo === undefined ? null : (String(activo).toLowerCase() === 'true' ? 1 : 0);

  const rows = await ejecutarSP('sp_Expedientes_Listar', {
    q,
    page: pageNum,
    pageSize: pageSizeNum,
    estado: estado ?? null,
    activo: activoBit
  });

  const total = rows?.[0]?.total ?? 0;
  res.json({ page: pageNum, pageSize: pageSizeNum, total, data: rows });
}

export async function obtenerExpedientePorCodigo(req: Request, res: Response) {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({ message: 'El código es requerido' });
  }

  try {
    const rows = await ejecutarSP('dbo.sp_Expedientes_ObtenerPorCodigo', { codigo });
    if (!rows?.length) return res.status(404).json({ message: 'Expediente no encontrado' });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error obteniendo expediente', error: String(err?.message || '') });
  }
}


export async function crearExpediente(req: Request, res: Response) {
  let { codigo, descripcion } = req.body as { codigo: string; descripcion: string };
  const tecnico_id = req.user!.id;

  codigo = (codigo ?? '').toString().trim();
  descripcion = (descripcion ?? '').toString().trim();
  if (!codigo) return res.status(400).json({ message: 'codigo requerido' });
  if (!descripcion) return res.status(400).json({ message: 'descripcion requerida' });

  try {
    const rows = await ejecutarSP('sp_Expedientes_Crear', { codigo, descripcion, tecnico_id });
    const created = rows?.[0] ?? null;
    if (!created) return res.status(201).json({ ok: true });
    return res.status(201).json(created);
  } catch (err: any) {
    const msg = String(err?.message || '');

    if (msg.includes('CODIGO_REQUERIDO'))
      return res.status(400).json({ message: 'codigo requerido' });

    if (msg.includes('DESCRIPCION_REQUERIDA'))
      return res.status(400).json({ message: 'descripcion requerida' });

    if (msg.includes('CODIGO_DUPLICADO'))
      return res.status(409).json({ message: 'El código ya existe' });

    return res.status(500).json({ message: 'Error creando expediente', error: msg });
  }
}


export async function actualizarExpedientePorCodigo(req: Request, res: Response) {
  const { codigo: codigoPath } = req.params;
  let { codigo, descripcion } = req.body as { codigo: string; descripcion: string };
  const tecnico_id = req.user!.id;

  const codigo_lookup = (codigoPath ?? '').toString().trim(); 
  codigo = (codigo ?? '').toString().trim();                  
  descripcion = (descripcion ?? '').toString().trim();

  if (!codigo_lookup) return res.status(400).json({ message: 'codigo de ruta requerido' });
  if (!codigo) return res.status(400).json({ message: 'codigo requerido' });
  if (!descripcion) return res.status(400).json({ message: 'descripcion requerida' });

  try {
    
    const rows = await ejecutarSP('dbo.sp_Expedientes_Actualizar', {
      codigo_lookup,
      codigo,
      descripcion,
      tecnico_id
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No encontrado o sin permisos' });
    }

    return res.json(rows[0]);
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('NO_AUTORIZADO_O_NO_ENCONTRADO')) {
      return res.status(404).json({ message: 'No encontrado o sin permisos' });
    }
    if (msg.includes('CODIGO_DUPLICADO')) {
      return res.status(409).json({ message: 'El código ya existe' });
    }
    if (msg.includes('FALTA_ID_O_CODIGO')) {
      return res.status(400).json({ message: 'Falta id o codigo' });
    }
    return res.status(500).json({ message: 'Error interno', error: msg });
  }
}


export async function cambiarEstadoPorCodigo(req: Request, res: Response) {
  const { codigo } = req.params;
  let { estado, justificacion } = req.body as { estado: string; justificacion?: string };
  const aprobador_id = req.user!.id;


  const codigoNorm = (codigo ?? '').toString().trim();
  estado = (estado ?? '').toString().trim().toLowerCase();
  justificacion = justificacion?.toString().trim();

  if (!codigoNorm) return res.status(400).json({ message: 'codigo requerido' });
  if (!estado) return res.status(400).json({ message: 'estado requerido' });
  if (!['aprobado', 'rechazado'].includes(estado))
    return res.status(400).json({ message: 'estado inválido (aprobado|rechazado)' });

  if (estado === 'rechazado' && (!justificacion || justificacion.length === 0)) {
    return res.status(400).json({ message: 'justificacion requerida cuando estado = rechazado' });
  }

  try {
    const rows = await ejecutarSP('sp_Expedientes_CambiarEstado', {
      codigo: codigoNorm,
      estado,
      justificacion,
      aprobador_id
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(rows[0]);
  } catch (err: any) {
    const msg = String(err?.message || '');

    if (msg.includes('ESTADO_INVALIDO')) {
      return res.status(400).json({ message: 'estado inválido (aprobado|rechazado)' });
    }
    if (msg.includes('EXPEDIENTE_NO_ENCONTRADO')) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    if (msg.includes('APROBADOR_INVALIDO')) {
      return res.status(403).json({ message: 'Aprobador inválido (se requiere coordinador activo)' });
    }
    if (msg.includes('JUSTIFICACION_REQUERIDA')) {
      return res.status(400).json({ message: 'justificacion requerida cuando estado = rechazado' });
    }

    return res.status(500).json({ message: 'Error interno', error: msg });
  }
}

export async function activarDesactivarPorCodigo(req: Request, res: Response) {
  const { codigo } = req.params;
  let { activo } = req.body as { activo: boolean | number | string };

  const codigoNorm = (codigo ?? '').toString().trim();
  if (!codigoNorm) return res.status(400).json({ message: 'codigo requerido' });

  // Normaliza "activo" a bit (0/1)
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
    const rows = await ejecutarSP('sp_Expedientes_ActivarDesactivar', {
      codigo: codigoNorm,
      activo
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

   
    return res.json(rows[0]);
  } catch (err: any) {
    const msg = String(err?.message || '');

    if (msg.includes('FALTA_ID_O_CODIGO')) {
      return res.status(400).json({ message: 'Falta id o codigo' });
    }
    if (msg.includes('EXPEDIENTE_NO_ENCONTRADO')) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.status(500).json({ message: 'Error interno', error: msg });
  }
}
