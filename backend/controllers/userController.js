import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, name, registration_number, role, authorized_forklifts, is_active FROM users ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, name, registration_number, role, authorized_forklifts } = req.body;

    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR registration_number = $2',
      [username, registration_number]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário ou matrícula já existem' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, name, registration_number, role, authorized_forklifts) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, name, registration_number, role, authorized_forklifts`,
      [username, hashedPassword, name, registration_number, role, authorized_forklifts || []]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, registration_number, role, authorized_forklifts, is_active } = req.body;

    const result = await pool.query(
      `UPDATE users SET username = $1, name = $2, registration_number = $3, role = $4, 
       authorized_forklifts = $5, is_active = $6 
       WHERE id = $7 RETURNING id, username, name, registration_number, role, authorized_forklifts, is_active`,
      [username, name, registration_number, role, authorized_forklifts || [], is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Não permitir deletar o próprio usuário
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
