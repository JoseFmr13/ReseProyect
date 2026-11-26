import { Router } from 'express';
import { verificarToken } from '../middleware/auth.js';
import { listarViajes, obtenerViaje } from '../controllers/viajeController.js';

const router = Router();
router.use(verificarToken);
router.get('/', listarViajes);
router.get('/:id', obtenerViaje);
export default router;