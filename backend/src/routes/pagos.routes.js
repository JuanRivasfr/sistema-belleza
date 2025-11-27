import express from 'express';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Registrar pago
router.post('/', authenticate, async (req, res) => {
  try {
    const { cita_id, metodo_pago, valor, referencia } = req.body;

    const { rows } = await db.query(
      `INSERT INTO pagos (cita_id, metodo_pago, valor, referencia)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cita_id, metodo_pago, valor, referencia]
    );

    res.status(201).json(rows[0]);

  } catch (error) {
    console.error("Error registrando pago:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
