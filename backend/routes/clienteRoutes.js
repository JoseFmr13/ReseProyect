import { Router } from 'express';
import { verificarToken } from '../middleware/auth.js';
import { crearCliente, listarClientes, obtenerCliente, actualizarCliente } from '../controllers/clienteController.js';

const router = Router();
router.use(verificarToken);
router.route('/').get(listarClientes).post(crearCliente);
router.route('/:id').get(obtenerCliente).put(actualizarCliente);
export default router;