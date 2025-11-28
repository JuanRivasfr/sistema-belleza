import db from '../config/db.js';

export async function createPago({ cita_id, metodo_pago, valor, referencia = null }) {
  const { rows } = await db.query(
    `INSERT INTO pagos (cita_id, metodo_pago, valor, referencia)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [cita_id, metodo_pago, valor, referencia]
  );
  return rows[0];
}

export async function listPagosByCita(cita_id) {
  const { rows } = await db.query(
    `SELECT * FROM pagos WHERE cita_id = $1 ORDER BY fecha DESC`,
    [cita_id]
  );
  return rows;
}

export async function listAllPagos() {
  const { rows } = await db.query(`SELECT * FROM pagos ORDER BY fecha DESC`);
  return rows;
}