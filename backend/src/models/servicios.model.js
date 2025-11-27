import db from '../config/db.js';

export async function createServicio({ nombre, descripcion, precio, categoria, duracion_minutos }) {
  const { rows } = await db.query(
    `INSERT INTO servicios (nombre, descripcion, precio, categoria, duracion_minutos)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [nombre, descripcion, precio, categoria, duracion_minutos]
  );
  return rows[0];
}

export async function updateServicio(id, data) {
  const { rows } = await db.query(
    `UPDATE servicios SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, duracion_minutos=$5, updated_at=now()
     WHERE id=$6 RETURNING *`,
    [data.nombre, data.descripcion, data.precio, data.categoria, data.duracion_minutos, id]
  );
  return rows[0];
}

export async function deleteServicio(id) {
  await db.query('DELETE FROM servicios WHERE id = $1', [id]);
}

export async function listServicios() {
  const { rows } = await db.query('SELECT * FROM servicios ORDER BY nombre');
  return rows;
}

export async function getServicioById(id) {
  const { rows } = await db.query('SELECT * FROM servicios WHERE id = $1', [id]);
  return rows[0];
}
