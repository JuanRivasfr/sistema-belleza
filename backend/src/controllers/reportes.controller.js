// src/controllers/reportes.controller.js
import db from "../config/db.js";

// Reporte diario
export const reporteDiario = async (req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10);

    const result = await db.query(
      `SELECT c.*, cl.nombre AS cliente_nombre, cl.apellido AS cliente_apellido
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       WHERE c.fecha = $1
       ORDER BY c.hora_inicio ASC`,
      [hoy]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error en reporteDiario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Reporte semanal
export const reporteSemanal = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM citas
       WHERE fecha >= NOW() - INTERVAL '7 days'
       ORDER BY fecha DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error en reporteSemanal:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Reporte mensual
export const reporteMensual = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM citas
       WHERE fecha >= date_trunc('month', NOW())
       ORDER BY fecha DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error en reporteMensual:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Servicios más vendidos
export const serviciosMasVendidos = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.nombre, COUNT(cs.servicio_id) AS cantidad
       FROM cita_servicios cs
       INNER JOIN servicios s ON cs.servicio_id = s.id
       GROUP BY s.nombre
       ORDER BY cantidad DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error en serviciosMasVendidos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Clientes frecuentes
export const clientesFrecuentes = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cl.id, cl.nombre, cl.apellido, COUNT(c.id) AS total_citas
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       GROUP BY cl.id
       ORDER BY total_citas DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error en clientesFrecuentes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Historial de ventas
export const historialVentas = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM ventas ORDER BY fecha DESC`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en historialVentas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
