import express from 'express';
import db from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Reporte mensual de ventas
 * Ejemplo:
 * /api/reportes/ventas?from=2025-01-01&to=2025-01-31
 */
router.get('/ventas', authenticate, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;

    const { rows } = await db.query(
      `SELECT date_trunc('day', fecha) AS dia, SUM(valor) AS total
       FROM pagos
       WHERE fecha BETWEEN $1 AND $2
       GROUP BY dia
       ORDER BY dia`,
      [from, to]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error generando reporte de ventas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
