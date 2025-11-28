import express from 'express';
import * as empleadosCtrl from '../controllers/empleados.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, empleadosCtrl.listEmpleados);

export default router;