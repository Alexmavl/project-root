import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { requireRole } from '../auth/role.middleware';
import { requireFields } from '../middlewares/validate.middleware';
import {
  listarIndiciosPorExpedientePorCodigo,
  crearIndicioPorCodigo,
  actualizarIndicioPorCodigo,
  activarDesactivarIndicioPorCodigo
} from '../controllers/indicio.controller';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Indicios
 *   description: Gestión de indicios (solo por CÓDIGO)
 */

/**
 * @swagger
 * /expedientes/{codigo}/indicios:
 *   get:
 *     summary: Listar indicios por expediente (por código)
 *     tags: [Indicios]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string }
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
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: OK }
 */
router.get('/expedientes/:codigo/indicios', requireAuth, listarIndiciosPorExpedientePorCodigo);

/**
 * @swagger
 * /expedientes/{codigo}/indicios:
 *   post:
 *     summary: Crear indicio en expediente (por código)
 *     tags: [Indicios]
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
 *             required: [codigo, descripcion, peso]
 *             properties:
 *               codigo: { type: string, description: "Código del indicio" }
 *               descripcion: { type: string }
 *               peso: { type: number }
 *               color: { type: string }
 *               tamano: { type: string }
 *     responses:
 *       201: { description: Creado }
 *       409: { description: Código duplicado }
 */
router.post(
  '/expedientes/:codigo/indicios',
  requireAuth,
  requireRole('tecnico'),
  requireFields(['codigo', 'descripcion', 'peso']),
  crearIndicioPorCodigo
);

/**
 * @swagger
 * /expedientes/{codigo}/indicios/{codigoIndicio}:
 *   put:
 *     summary: Actualizar indicio (por códigos)
 *     tags: [Indicios]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string, description: "Código del expediente" }
 *       - in: path
 *         name: codigoIndicio
 *         required: true
 *         schema: { type: string, description: "Código actual del indicio (lookup)" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, descripcion, peso]
 *             properties:
 *               codigo: { type: string, description: "Nuevo código (o el mismo)" }
 *               descripcion: { type: string }
 *               peso: { type: number }
 *               color: { type: string }
 *               tamano: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 *       409: { description: Código duplicado }
 */
router.put(
  '/expedientes/:codigo/indicios/:codigoIndicio',
  requireAuth,
  requireRole('tecnico'),
  requireFields(['codigo', 'descripcion', 'peso']),
  actualizarIndicioPorCodigo
);

/**
 * @swagger
 * /expedientes/{codigo}/indicios/{codigoIndicio}/activo:
 *   patch:
 *     summary: Activar/Desactivar indicio (por códigos)
 *     tags: [Indicios]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string, description: "Código del expediente" }
 *       - in: path
 *         name: codigoIndicio
 *         required: true
 *         schema: { type: string, description: "Código del indicio (lookup)" }
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
  '/expedientes/:codigo/indicios/:codigoIndicio/activo',
  requireAuth,
  requireFields(['activo']),
  activarDesactivarIndicioPorCodigo
);

export default router;
