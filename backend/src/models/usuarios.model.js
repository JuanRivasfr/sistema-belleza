import db from '../config/db.js';

export async function findByEmail(email) {
  const { rows } = await db.query(
    'SELECT * FROM usuarios WHERE correo = $1',
    [email]
  );
  return rows[0];
}

export async function createUsuario({ nombre_completo, correo, password_hash, telefono, rol = 'admin' }) {
  const { rows } = await db.query(
    `INSERT INTO usuarios (nombre_completo, correo, password_hash, telefono, rol)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, nombre_completo, correo, rol`,
    [nombre_completo, correo, password_hash, telefono, rol]
  );
  return rows[0];
}
