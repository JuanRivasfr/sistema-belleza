import express from 'express';
import * as serviciosCtrl from '../controllers/servicios.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, serviciosCtrl.listServicios);
router.post('/', authenticate, requireAdmin, serviciosCtrl.createServicio);
router.put('/:id', authenticate, requireAdmin, serviciosCtrl.updateServicio);
router.delete('/:id', authenticate, requireAdmin, serviciosCtrl.deleteServicio);

export default router;
