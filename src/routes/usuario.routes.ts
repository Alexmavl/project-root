import { Router } from 'express';
import { crearUsuario, listarUsuarios } from '../controllers/usuario.controller';
import { requireFields } from '../middlewares/validate.middleware';
import { requireRole } from '../auth/role.middleware';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */


/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuarios
 *     tags: [Usuarios]
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
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', requireAuth, requireRole('coordinador'), listarUsuarios);



/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, rol, password]
 *             properties:
 *               nombre: { type: string }
 *               email: { type: string }
 *               rol: { type: string, enum: [tecnico, coordinador] }
 *               password: { type: string }
 *     responses:
 *       201: { description: Usuario creado }
 *       409: { description: Email ya existe }
 */
router.post('/', requireFields(['nombre', 'email', 'rol', 'password']), crearUsuario);

export default router;
