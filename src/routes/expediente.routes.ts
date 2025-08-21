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

/**
 * @swagger
 * /expedientes:
 *   get:
 *     summary: Listar expedientes
 *     tags: [Expedientes]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [pendiente, aprobado, rechazado] }
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', requireAuth, listarExpedientes);

/**
 * @swagger
 * /expedientes/{id}:
 *   get:
 *     summary: Obtener expediente por id
 *     tags: [Expedientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.get('/:id', requireAuth, obtenerExpediente);

/**
 * @swagger
 * /expedientes:
 *   post:
 *     summary: Crear expediente
 *     tags: [Expedientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, descripcion]
 *             properties:
 *               codigo: { type: string }
 *               descripcion: { type: string }
 *     responses:
 *       201: { description: Creado }
 *       409: { description: Código duplicado }
 */
router.post('/', requireAuth, requireRole('tecnico'), requireFields(['codigo', 'descripcion']), crearExpediente);

/**
 * @swagger
 * /expedientes/{id}:
 *   put:
 *     summary: Actualizar expediente
 *     tags: [Expedientes]
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
 *             required: [codigo, descripcion]
 *             properties:
 *               codigo: { type: string }
 *               descripcion: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado o sin permisos }
 */
router.put('/:id', requireAuth, requireRole('tecnico'), requireFields(['codigo', 'descripcion']), actualizarExpediente);

/**
 * @swagger
 * /expedientes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado del expediente
 *     tags: [Expedientes]
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
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [aprobado, rechazado] }
 *               justificacion: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Estado inválido o justificación requerida }
 *       404: { description: No encontrado }
 *       403: { description: Aprobador inválido }
 */
router.patch('/:id/estado', requireAuth, requireRole('coordinador'), requireFields(['estado']), cambiarEstadoExpediente);

/**
 * @swagger
 * /expedientes/{id}/activo:
 *   patch:
 *     summary: Activar/Desactivar expediente
 *     tags: [Expedientes]
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
router.patch('/:id/activo', requireAuth, requireFields(['activo']), activarDesactivarExpediente);

export default router;
