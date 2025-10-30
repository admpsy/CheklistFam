import pool from '../config/database.js';

export const getForklifts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM forklifts ORDER BY serial_number'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar empilhadeiras:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createForklift = async (req, res) => {
  try {
    const { serial_number, model, capacity, current_status, last_horimeter } = req.body;

    // Verificar se número de série já existe
    const existingForklift = await pool.query(
      'SELECT id FROM forklifts WHERE serial_number = $1',
      [serial_number]
    );

    if (existingForklift.rows.length > 0) {
      return res.status(400).json({ error: 'Número de série já existe' });
    }

    const result = await pool.query(
      `INSERT INTO forklifts (serial_number, model, capacity, current_status, last_horimeter) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [serial_number, model, capacity, current_status || 'IN_SERVICE', last_horimeter || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar empilhadeira:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateForklift = async (req, res) => {
  try {
    const { id } = req.params;
    const { serial_number, model, capacity, current_status, last_horimeter, is_active } = req.body;

    const result = await pool.query(
      `UPDATE forklifts SET serial_number = $1, model = $2, capacity = $3, 
       current_status = $4, last_horimeter = $5, is_active = $6 
       WHERE id = $7 RETURNING *`,
      [serial_number, model, capacity, current_status, last_horimeter, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empilhadeira não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar empilhadeira:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteForklift = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se existem checklists para esta empilhadeira
    const checklistsResult = await pool.query(
      'SELECT id FROM checklists WHERE forklift_id = $1 LIMIT 1',
      [id]
    );

    if (checklistsResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir empilhadeira com checklists associados' 
      });
    }

    const result = await pool.query('DELETE FROM forklifts WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Empilhadeira não encontrada' });
    }

    res.json({ message: 'Empilhadeira excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir empilhadeira:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
