import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as usuariosModel from '../models/usuarios.model.js';
import db from '../config/db.js';

// LOGIN
export async function login(req, res) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no está definido en .env");
  }

  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ message: 'Correo y contraseña requeridos' });
  }

  const user = await usuariosModel.findByEmail(correo);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: user.id, correo: user.correo, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      nombre_completo: user.nombre_completo,
      correo: user.correo,
      rol: user.rol
    }
  });
}

// REGISTRO
export async function register(req, res) {
  try {

    const { nombre_completo, correo, password, rol } = req.body;

    if (!nombre_completo || !correo || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const existUser = await usuariosModel.findByEmail(correo);
    if (existUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuarios (nombre_completo, correo, password_hash, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre_completo, correo, rol
    `;

    const values = [nombre_completo, correo, passwordHash, rol || "usuario"];

    const result = await db.query(query, values);
    const newUser = result.rows[0];

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: newUser
    });

  } catch (error) {
    console.error("Error registrando usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// CAMBIO DE CONTRASEÑA
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await usuariosModel.findByEmail(req.user.correo);

  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

  const hashed = await bcrypt.hash(newPassword, 10);

  await db.query(
    'UPDATE usuarios SET password_hash=$1, updated_at=now() WHERE id=$2',
    [hashed, userId]
  );

  res.json({ message: 'Contraseña actualizada' });
}
