import express from 'express';
import * as authCtrl from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', authCtrl.login);

router.post('/register', authCtrl.register); // ⭐ AGREGADO

router.post('/change-password', authenticate, authCtrl.changePassword);

export default router;
