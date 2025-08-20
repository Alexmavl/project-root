import { Router } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes';
import expedienteRoutes from './expediente.routes';
import indicioRoutes from './indicio.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/expedientes', expedienteRoutes);
router.use('/', indicioRoutes);

export default router;
