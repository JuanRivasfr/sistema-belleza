// src/controllers/pagos.controller.js
import db from "../config/db.js";

// Registrar un pago
export const registrarPago = async (req, res) => {
  try {
    const { cita_id, metodo_pago, valor, referencia } = req.body;

    if (!cita_id || !metodo_pago || !valor) {
      return res.status(400).json({
        message: "cita_id, metodo_pago y valor son obligatorios",
      });
    }

    // Insertar pago
    const pago = await db.query(
      `INSERT INTO pagos (cita_id, metodo_pago, valor, referencia)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cita_id, metodo_pago, valor, referencia || null]
    );

    // Registrar venta (historial)
    await db.query(
      `INSERT INTO ventas (total) VALUES ($1)`,
      [valor]
    );

    return res.json({
      message: "Pago registrado exitosamente",
      data: pago.rows[0],
    });
  } catch (error) {
    console.error("Error en registrarPago:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener pagos de una cita
export const obtenerPagosPorCita = async (req, res) => {
  try {
    const { cita_id } = req.params;

    const pagos = await db.query(
      `SELECT * FROM pagos WHERE cita_id = $1`,
      [cita_id]
    );

    res.json(pagos.rows);
  } catch (error) {
    console.error("Error en obtenerPagosPorCita:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los pagos
export const obtenerTodosPagos = async (req, res) => {
  try {
    const pagos = await db.query(`SELECT * FROM pagos ORDER BY fecha DESC`);
    res.json(pagos.rows);
  } catch (error) {
    console.error("Error en obtenerTodosPagos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
