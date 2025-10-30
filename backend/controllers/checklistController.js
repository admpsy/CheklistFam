import pool from '../config/database.js';

export const getChecklists = async (req, res) => {
  try {
    const { page = 1, limit = 20, forklift_id, operator_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, f.serial_number, f.model, u.name as operator_name 
      FROM checklists c
      JOIN forklifts f ON c.forklift_id = f.id
      JOIN users u ON c.operator_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (forklift_id) {
      paramCount++;
      query += ` AND c.forklift_id = $${paramCount}`;
      params.push(forklift_id);
    }

    if (operator_id) {
      paramCount++;
      query += ` AND c.operator_id = $${paramCount}`;
      params.push(operator_id);
    }

    if (start_date) {
      paramCount++;
      query += ` AND c.inspection_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND c.inspection_date <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` ORDER BY c.inspection_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar checklists:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createChecklist = async (req, res) => {
  try {
    const {
      forklift_id,
      initial_horimeter,
      final_horimeter,
      items_inspected,
      digital_signature,
      safety_stop_reason
    } = req.body;

    // Verificar se a empilhadeira existe e está ativa
    const forkliftResult = await pool.query(
      'SELECT * FROM forklifts WHERE id = $1 AND is_active = true',
      [forklift_id]
    );

    if (forkliftResult.rows.length === 0) {
      return res.status(400).json({ error: 'Empilhadeira não encontrada ou inativa' });
    }

    // Determinar status da inspeção
    let inspection_status = 'CONFORM';
    const hasCriticalNC = checkForCriticalNonConformities(items_inspected);
    
    if (hasCriticalNC) {
      inspection_status = 'NON_CONFORM';
      // Atualizar status da empilhadeira para "Fora de Serviço"
      await pool.query(
        'UPDATE forklifts SET current_status = $1 WHERE id = $2',
        ['OUT_OF_SERVICE', forklift_id]
      );
    }

    // Calcular horas de uso
    const hours_of_use = final_horimeter ? final_horimeter - initial_horimeter : null;

    // Atualizar último horímetro da empilhadeira
    if (final_horimeter) {
      await pool.query(
        'UPDATE forklifts SET last_horimeter = $1 WHERE id = $2',
        [final_horimeter, forklift_id]
      );
    }

    const result = await pool.query(
      `INSERT INTO checklists (
        forklift_id, operator_id, initial_horimeter, final_horimeter, 
        hours_of_use, inspection_status, items_inspected, digital_signature, safety_stop_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        forklift_id,
        req.user.id,
        initial_horimeter,
        final_horimeter,
        hours_of_use,
        inspection_status,
        items_inspected,
        digital_signature,
        safety_stop_reason
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar checklist:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Função auxiliar para verificar NC críticos
function checkForCriticalNonConformities(items_inspected) {
  const criticalItems = [
    'Freios (serviço)',
    'Freios (estacionamento)',
    'Vazamentos (óleo, água, combustível)',
    'Nível de Óleo do Motor',
    'Sistema de Direção'
  ];

  for (const section in items_inspected) {
    for (const item of items_inspected[section]) {
      if (item.result === 'NC' && criticalItems.includes(item.item)) {
        return true;
      }
    }
  }
  return false;
}
