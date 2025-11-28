import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const userId = payload.id; // ← CORREGIDO

    const { rows } = await db.query(
      'SELECT id, nombre_completo, correo, rol FROM usuarios WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = rows[0];
    next();

  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Requiere rol admin' });
  }
  next();
};
