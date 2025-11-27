import db from '../config/db.js';

/**
 * Comprueba solapamiento para un especialista dado.
 * Recibe fecha (YYYY-MM-DD), horaInicio (HH:MM:SS) y horaFin (HH:MM:SS)
 */
export async function hasOverlap(especialista_id, fecha, horaInicio, horaFin, excludeCitaId = null) {
  const params = [especialista_id, fecha, horaInicio, horaFin];
  let query = `
    SELECT 1 FROM citas
    WHERE especialista_id = $1
      AND fecha = $2
      AND NOT (hora_fin <= $3 OR hora_inicio >= $4)
  `;

  if (excludeCitaId) {
    params.push(excludeCitaId);
    query += ` AND id != $5`;
  }

  const { rows } = await db.query(query, params);
  return rows.length > 0;
}

export async function createCita({ cliente_id, especialista_id, fecha, hora_inicio, hora_fin }) {
  const { rows } = await db.query(
    `INSERT INTO citas (cliente_id, especialista_id, fecha, hora_inicio, hora_fin)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [cliente_id, especialista_id, fecha, hora_inicio, hora_fin]
  );
  return rows[0];
}

export async function addServicioToCita(cita_id, servicio_id) {
  await db.query(
    `INSERT INTO cita_servicios (cita_id, servicio_id)
     VALUES ($1,$2)
     ON CONFLICT DO NOTHING`,
    [cita_id, servicio_id]
  );
}

export async function getCitaById(id) {
  const { rows } = await db.query('SELECT * FROM citas WHERE id = $1', [id]);
  return rows[0];
}

export async function listCitasByFecha(fecha) {
  const { rows } = await db.query(
    `SELECT c.*, cl.nombre AS cliente_nombre, cl.apellido AS cliente_apellido
     FROM citas c
     LEFT JOIN clientes cl ON c.cliente_id = cl.id
     WHERE c.fecha = $1
     ORDER BY hora_inicio`,
    [fecha]
  );
  return rows;
}

export async function updateCitaEstado(id, estado) {
  const { rows } = await db.query(
    `UPDATE citas
     SET estado = $1, updated_at = now()
     WHERE id = $2 RETURNING *`,
    [estado, id]
  );
  return rows[0];
}

export async function updateCitaTimes(id, fecha, hora_inicio, hora_fin) {
  const { rows } = await db.query(
    `UPDATE citas
     SET fecha = $1, hora_inicio = $2, hora_fin = $3, updated_at = now()
     WHERE id = $4 RETURNING *`,
    [fecha, hora_inicio, hora_fin, id]
  );
  return rows[0];
}
