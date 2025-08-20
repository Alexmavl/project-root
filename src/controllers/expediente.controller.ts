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


export async function obtenerExpediente(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const rows = await ejecutarSP('sp_Expedientes_Obtener', { id });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(rows[0]);
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('EXPEDIENTE_NO_ENCONTRADO')) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    return res.status(500).json({ message: 'Error interno', error: msg });
  }
}

export async function crearExpediente(req: Request, res: Response) {
  let { codigo, descripcion } = req.body as { codigo: string; descripcion: string };
  const tecnico_id = req.user!.id;

  // Normalización + validaciones básicas
  codigo = (codigo ?? '').toString().trim();
  descripcion = (descripcion ?? '').toString().trim();
  if (!codigo) return res.status(400).json({ message: 'codigo requerido' });
  if (!descripcion) return res.status(400).json({ message: 'descripcion requerida' });

  try {
    const rows = await ejecutarSP('sp_Expedientes_Crear', { codigo, descripcion, tecnico_id });
    // El SP siempre devuelve 1 fila; por si acaso:
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

export async function actualizarExpediente(req: Request, res: Response) {
  const { id } = req.params;
  let { codigo, descripcion } = req.body as { codigo: string; descripcion: string };
  const tecnico_id = req.user!.id;

  // Normalización mínima
  codigo = (codigo ?? '').trim();
  descripcion = (descripcion ?? '').trim();

  // Validaciones rápidas
  if (!id) return res.status(400).json({ message: 'id requerido' });
  if (!codigo) return res.status(400).json({ message: 'codigo requerido' });
  if (!descripcion) return res.status(400).json({ message: 'descripcion requerida' });

  try {
    const rows = await ejecutarSP('sp_Expedientes_Actualizar', { id, codigo, descripcion, tecnico_id });

    // Paracaídas por si el SP no lanzó THROW y no retornó filas
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No encontrado o sin permisos' });
    }

    return res.json(rows[0]); // id, codigo, descripcion, estado, tecnico_id, ...
  } catch (err: any) {
    const msg = String(err?.message || '');

    if (msg.includes('NO_AUTORIZADO_O_NO_ENCONTRADO')) {
      // Puedes elegir 403 si quieres distinguir permisos; 404 oculta existencia
      return res.status(404).json({ message: 'No encontrado o sin permisos' });
    }
    if (msg.includes('CODIGO_DUPLICADO')) {
      return res.status(409).json({ message: 'El código ya existe' });
    }

    return res.status(500).json({ message: 'Error interno', error: msg });
  }
}

export async function cambiarEstadoExpediente(req: Request, res: Response) {
  const { id } = req.params;
  let { estado, justificacion } = req.body as { estado: string; justificacion?: string };
  const aprobador_id = req.user!.id; // asume requireAuth ya pobló req.user

  // Normalización y validaciones mínimas
  estado = (estado ?? '').toString().trim().toLowerCase();
  justificacion = justificacion?.toString().trim();

  if (!id) return res.status(400).json({ message: 'id requerido' });
  if (!estado) return res.status(400).json({ message: 'estado requerido' });
  if (!['aprobado', 'rechazado'].includes(estado))
    return res.status(400).json({ message: 'estado inválido (aprobado|rechazado)' });

  // Regla opcional: exigir justificación si rechazado (en línea con el SP)
  if (estado === 'rechazado' && (!justificacion || justificacion.length === 0)) {
    return res.status(400).json({ message: 'justificacion requerida cuando estado = rechazado' });
  }

  try {
    const rows = await ejecutarSP('sp_Expedientes_CambiarEstado', {
      id, estado, justificacion, aprobador_id
    });

    if (!rows || rows.length === 0) {
      // Paracaídas si el SP no devuelve fila (no debería pasar con THROW)
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
      // 403 si quieres dejar claro que no tiene perfil correcto
      return res.status(403).json({ message: 'Aprobador inválido (se requiere coordinador activo)' });
    }
    if (msg.includes('JUSTIFICACION_REQUERIDA')) {
      return res.status(400).json({ message: 'justificacion requerida cuando estado = rechazado' });
    }

    return res.status(500).json({ message: 'Error interno', error: msg });
  }
}

export async function activarDesactivarExpediente(req: Request, res: Response) {
  const { id } = req.params;
  let { activo } = req.body as { activo: boolean | number | string };

  // Normaliza "activo" a bit (0/1) por si viene como string/boolean
  if (typeof activo === 'string') {
    const v = activo.toLowerCase();
    if (v === 'true' || v === '1') activo = 1;
    else if (v === 'false' || v === '0') activo = 0;
  } else if (typeof activo === 'boolean') {
    activo = activo ? 1 : 0;
  }

  try {
    const rows = await ejecutarSP('sp_Expedientes_ActivarDesactivar', { id, activo });

    // Con el SP “robusto” normalmente siempre habrá 1 fila si existe;
    // este fallback cubre el caso de que no devuelva nada.
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(rows[0]); // { id, activo, actualizado_en }
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('EXPEDIENTE_NO_ENCONTRADO')) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    return res.status(500).json({ message: 'Error interno', error: msg });
  }
}