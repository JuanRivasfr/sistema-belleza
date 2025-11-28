import db from '../config/db.js';

export async function createCliente(cliente) {
  const { rows } = await db.query(
    `INSERT INTO clientes (nombre, apellido, telefono, correo, alias, cedula)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [cliente.nombre, cliente.apellido, cliente.telefono, cliente.correo, cliente.alias, cliente.cedula]
  );
  return rows[0];
}

export async function updateCliente(id, cliente) {
  const { rows } = await db.query(
    `UPDATE clientes 
     SET nombre=$1, apellido=$2, telefono=$3, correo=$4, alias=$5, cedula=$6, updated_at=now()
     WHERE id=$7 RETURNING *`,
    [cliente.nombre, cliente.apellido, cliente.telefono, cliente.correo, cliente.alias, cliente.cedula, id]
  );
  return rows[0];
}

export async function getClienteById(id) {
  const { rows } = await db.query(
    'SELECT * FROM clientes WHERE id = $1',
    [id]
  );
  return rows[0];
}

export async function searchClientes(q) {
  const like = `%${q}%`;
  const { rows } = await db.query(
    `SELECT * FROM clientes 
     WHERE nombre ILIKE $1 
     OR apellido ILIKE $1 
     OR correo ILIKE $1 
     OR telefono ILIKE $1 
     OR alias ILIKE $1`,
    [like]
  );
  return rows;
}

// nueva función para eliminar cliente
export async function deleteCliente(id) {
  const { rows } = await db.query(
    `DELETE FROM clientes WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
}
