// src/routes/expediente.routes.ts
import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { requireRole } from '../auth/role.middleware';
import { requireFields } from '../middlewares/validate.middleware';
import {
  listarExpedientes,
  obtenerExpedientePorCodigo,
  crearExpediente,
  // ← este debe actualizar por CÓDIGO (ver nota al final)
  actualizarExpedientePorCodigo,
  cambiarEstadoPorCodigo,
  activarDesactivarPorCodigo
} from '../controllers/expediente.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Expedientes
 *   description: Gestión de expedientes (basada en CÓDIGO)
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
router.post(
  '/',
  requireAuth,
  requireRole('tecnico'),
  requireFields(['codigo', 'descripcion']),
  crearExpediente
);

/**
 * @swagger
 * /expedientes/{codigo}:
 *   get:
 *     summary: Obtener expediente por código
 *     tags: [Expedientes]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.get('/:codigo', requireAuth, obtenerExpedientePorCodigo);

/**
 * @swagger
 * /expedientes/{codigo}:
 *   put:
 *     summary: Actualizar expediente por código
 *     tags: [Expedientes]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string }
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
 *       404: { description: No encontrado }
 *       409: { description: Código duplicado }
 */
router.put(
  '/:codigo',
  requireAuth,
  requireRole('tecnico'),
  requireFields(['codigo', 'descripcion']),
  actualizarExpedientePorCodigo
);

/**
 * @swagger
 * /expedientes/{codigo}/estado:
 *   patch:
 *     summary: Cambiar estado por código
 *     tags: [Expedientes]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string }
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
 *       403: { description: Aprobador inválido }
 *       404: { description: No encontrado }
 */
router.patch(
  '/:codigo/estado',
  requireAuth,
  requireRole('coordinador'),
  requireFields(['estado']),
  cambiarEstadoPorCodigo
);

/**
 * @swagger
 * /expedientes/{codigo}/activo:
 *   patch:
 *     summary: Activar/Desactivar por código
 *     tags: [Expedientes]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string }
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
  '/:codigo/activo',
  requireAuth,
  requireFields(['activo']),
  activarDesactivarPorCodigo
);

export default router;
