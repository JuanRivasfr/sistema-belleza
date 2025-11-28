import db from '../config/db.js';

export async function listEmpleados(req, res) {
  try {
    const { rows } = await db.query('SELECT id, nombre, apellido, telefono, cedula FROM empleados ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error listando empleados' });
  }
}