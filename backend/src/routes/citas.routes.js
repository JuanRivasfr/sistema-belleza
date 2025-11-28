import express from "express";
import * as citasCtrl from "../controllers/citas.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/', authenticate, requireAdmin, citasCtrl.crearCita);
router.put('/:id', authenticate, requireAdmin, citasCtrl.modificarCita);
// permitir que usuarios autenticados puedan cancelar/reprogramar;
// si quieres mantenerlo solo para admins, deja requireAdmin y asegúrate de usar token admin en frontend
router.post('/:id/cancel', authenticate, citasCtrl.cancelarCita);
router.get('/', authenticate, citasCtrl.listarCitasPorFecha);
router.get('/especialista/:id/available', authenticate, citasCtrl.getDisponibilidadEspecialista);
router.delete('/:id', authenticate, requireAdmin, citasCtrl.deleteCita);

export default router;
