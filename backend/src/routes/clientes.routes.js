import express from 'express';
import * as clientesCtrl from '../controllers/clientes.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, requireAdmin, clientesCtrl.createCliente);
router.put('/:id', authenticate, requireAdmin, clientesCtrl.updateCliente);
router.get('/:id', authenticate, clientesCtrl.getCliente);
router.get('/', authenticate, clientesCtrl.searchClientes); // ?q=
// nueva ruta DELETE
router.delete('/:id', authenticate, requireAdmin, clientesCtrl.deleteCliente);

export default router;
