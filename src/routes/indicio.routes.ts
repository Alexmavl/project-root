import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { requireRole } from '../auth/role.middleware';
import { requireFields } from '../middlewares/validate.middleware';
import {
  listarIndiciosPorExpediente, crearIndicio, actualizarIndicio, activarDesactivarIndicio
} from '../controllers/indicio.controller';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Indicios
 *   description: Gestión de indicios
 */

router.get('/expedientes/:id/indicios', requireAuth, listarIndiciosPorExpediente);
router.post('/expedientes/:id/indicios', requireAuth, requireRole('tecnico'), requireFields(['codigo', 'descripcion', 'peso']), crearIndicio);
router.put('/indicios/:id', requireAuth, requireRole('tecnico'), requireFields(['codigo', 'descripcion', 'peso']), actualizarIndicio);
router.patch('/indicios/:id/activo', requireAuth, requireFields(['activo']), activarDesactivarIndicio);

export default router;
