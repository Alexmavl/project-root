import { Router } from 'express';
import { crearUsuario } from '../controllers/usuario.controller';
import { requireFields } from '../middlewares/validate.middleware';

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
