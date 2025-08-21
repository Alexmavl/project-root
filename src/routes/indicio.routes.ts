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

/**
 * @swagger
 * /expedientes/{id}/indicios:
 *   get:
 *     summary: Listar indicios por expediente
 *     tags: [Indicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 */
router.get('/expedientes/:id/indicios', requireAuth, listarIndiciosPorExpediente);

/**
 * @swagger
 * /expedientes/{id}/indicios:
 *   post:
 *     summary: Crear un nuevo indicio en un expediente
 *     tags: [Indicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, descripcion, peso]
 *             properties:
 *               codigo: { type: string }
 *               descripcion: { type: string }
 *               peso: { type: number }
 *     responses:
 *       201: { description: Creado }
 */
router.post(
  '/expedientes/:id/indicios',
  requireAuth,
  requireRole('tecnico'),
  requireFields(['codigo', 'descripcion', 'peso']),
  crearIndicio
);

/**
 * @swagger
 * /indicios/{id}:
 *   put:
 *     summary: Actualizar indicio
 *     tags: [Indicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, descripcion, peso]
 *             properties:
 *               codigo: { type: string }
 *               descripcion: { type: string }
 *               peso: { type: number }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.put(
  '/indicios/:id',
  requireAuth,
  requireRole('tecnico'),
  requireFields(['codigo', 'descripcion', 'peso']),
  actualizarIndicio
);

/**
 * @swagger
 * /indicios/{id}/activo:
 *   patch:
 *     summary: Activar o desactivar un indicio
 *     tags: [Indicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activo]
 *             properties:
 *               activo: { type: boolean }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.patch(
  '/indicios/:id/activo',
  requireAuth,
  requireFields(['activo']),
  activarDesactivarIndicio
);

export default router;
