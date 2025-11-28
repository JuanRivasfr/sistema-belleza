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

// Listar todos los pagos con nombres
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id,
        p.cita_id,
        cli.nombre AS cliente_nombre,
        cli.apellido AS cliente_apellido,
        e.nombre AS especialista_nombre,
        e.apellido AS especialista_apellido,
        p.metodo_pago,
        p.valor,
        p.referencia,
        p.fecha
      FROM pagos p
      LEFT JOIN citas c ON p.cita_id = c.id
      LEFT JOIN clientes cli ON c.cliente_id = cli.id
      LEFT JOIN empleados e ON c.especialista_id = e.id
      ORDER BY p.fecha DESC
    `);

    console.log(rows);

    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Listar pagos por cita
router.get('/cita/:cita_id', authenticate, async (req, res) => {
  try {
    const { cita_id } = req.params;

    const { rows } = await db.query(
      `SELECT * FROM pagos WHERE cita_id = $1 ORDER BY fecha DESC`,
      [cita_id]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error obteniendo pagos por cita:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
