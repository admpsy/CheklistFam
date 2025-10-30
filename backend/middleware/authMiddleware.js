import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'forklift_secret_key';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userResult = await pool.query(
      'SELECT id, username, name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(403).json({ error: 'Usuário não encontrado ou inativo' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMINISTRATOR') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
};
