import { Router } from 'express';
import { verificarToken, soloAdmin } from '../middleware/auth.js';
import {
  crearReservacion, listarReservaciones, obtenerReservacion,
  modificarReservacion, solicitarCancelacion, resolverSolicitud, resumen,
} from '../controllers/reservacionController.js';

const router = Router();
router.use(verificarToken);
router.get('/resumen', resumen); // debe ir antes de '/:id'
router.route('/').get(listarReservaciones).post(crearReservacion);
router.route('/:id').get(obtenerReservacion).put(modificarReservacion);
router.post('/:id/solicitud', solicitarCancelacion);
router.patch('/:id/solicitud', soloAdmin, resolverSolicitud);
export default router;