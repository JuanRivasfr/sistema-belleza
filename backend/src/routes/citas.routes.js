import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import * as citasCtrl from '../controllers/citas.controller.js';

const router = express.Router();

// Según requerimiento: sólo ADMIN puede crear cita (RF A1)
router.post('/', authenticate, requireAdmin, citasCtrl.crearCita);
router.put('/:id', authenticate, requireAdmin, citasCtrl.modificarCita); // reprogramar
router.post('/:id/cancel', authenticate, requireAdmin, citasCtrl.cancelarCita);
router.get('/', authenticate, citasCtrl.listarCitasPorFecha); // ?fecha=YYYY-MM-DD

export default router;
