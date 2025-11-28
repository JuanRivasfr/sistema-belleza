import db from '../config/db.js'; // ajusta la ruta si es otra

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

export async function createCitaWithServicios({ cliente_id, especialista_id, fecha, hora_inicio, hora_fin, servicios }) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const insertCita = `
      INSERT INTO citas (cliente_id, especialista_id, fecha, hora_inicio, hora_fin)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `;
    const { rows } = await client.query(insertCita, [cliente_id, especialista_id, fecha, hora_inicio, hora_fin]);
    const cita = rows[0];

    if (Array.isArray(servicios) && servicios.length > 0) {
      const values = servicios.map((_, i) => `($1, $${i + 2})`).join(', ');
      const params = [cita.id, ...servicios];
      const insertServ = `INSERT INTO cita_servicios (cita_id, servicio_id) VALUES ${values} ON CONFLICT DO NOTHING`;
      await client.query(insertServ, params);
    }

    await client.query('COMMIT');
    return cita;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function addServicioToCita(cita_id, servicio_id) {
  // keep for compatibility
  const { rows } = await db.query(
    `INSERT INTO cita_servicios (cita_id, servicio_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING *`,
    [cita_id, servicio_id]
  );
  return rows[0] || null;
}

export async function getCitaById(id) {
  const { rows } = await db.query('SELECT * FROM citas WHERE id = $1', [id]);
  return rows[0];
}

export async function listCitasByFecha(fecha) {
  // devolver filas con cliente, especialista y array de servicios
  const { rows } = await db.query(
    `SELECT
       c.*,
       cl.nombre AS nombre_cliente,
       cl.apellido AS apellido_cliente,
       cl.telefono AS cliente_telefono,
       e.nombre AS nombre_especialista,
       e.apellido AS apellido_especialista,
       COALESCE(json_agg(json_build_object(
         'id', s.id,
         'nombre', s.nombre,
         'duracion_minutos', s.duracion_minutos,
         'precio', s.precio
       ) ) FILTER (WHERE s.id IS NOT NULL), '[]') AS servicios
     FROM citas c
     LEFT JOIN clientes cl ON cl.id = c.cliente_id
     LEFT JOIN empleados e ON e.id = c.especialista_id
     LEFT JOIN cita_servicios cs ON cs.cita_id = c.id
     LEFT JOIN servicios s ON s.id = cs.servicio_id
     WHERE c.fecha = $1
       AND c.estado != 'cancelada'   -- <-- filtrar citas canceladas
     GROUP BY c.id, cl.nombre, cl.apellido, cl.telefono, e.nombre, e.apellido
     ORDER BY c.hora_inicio`,
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

export async function updateCitaFields(id, cliente_id, especialista_id, fecha, hora_inicio, hora_fin) {
  const { rows } = await db.query(
    `UPDATE citas
     SET cliente_id = $1,
         especialista_id = $2,
         fecha = $3,
         hora_inicio = $4,
         hora_fin = $5,
         updated_at = now()
     WHERE id = $6
     RETURNING *`,
    [cliente_id, especialista_id, fecha, hora_inicio, hora_fin, id]
  );
  return rows[0];
}

// ====================== nuevo ======================
export async function deleteCita(id) {
  const { rows } = await db.query(
    `DELETE FROM citas WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}
