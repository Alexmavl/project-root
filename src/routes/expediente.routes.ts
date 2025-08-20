import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { requireRole } from '../auth/role.middleware';
import { requireFields } from '../middlewares/validate.middleware';
import {
  listarExpedientes, obtenerExpediente, crearExpediente,
  actualizarExpediente, cambiarEstadoExpediente, activarDesactivarExpediente
} from '../controllers/expediente.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Expedientes
 *   description: Gestión de expedientes
 */

router.get('/', requireAuth, listarExpedientes);
router.get('/:id', requireAuth, obtenerExpediente);
router.post('/', requireAuth, requireRole('tecnico'), requireFields(['codigo', 'descripcion']), crearExpediente);
router.put('/:id', requireAuth, requireRole('tecnico'), requireFields(['codigo', 'descripcion']), actualizarExpediente);
router.patch('/:id/estado', requireAuth, requireRole('coordinador'), requireFields(['estado']), cambiarEstadoExpediente);
router.patch('/:id/activo', requireAuth, requireFields(['activo']), activarDesactivarExpediente);

export default router;
