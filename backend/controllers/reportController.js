import pool from '../config/database.js';

export const getDashboardData = async (req, res) => {
  try {
    // Total de empilhadeiras
    const forkliftsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN current_status = 'IN_SERVICE' THEN 1 END) as in_service,
        COUNT(CASE WHEN current_status = 'OUT_OF_SERVICE' THEN 1 END) as out_of_service
      FROM forklifts WHERE is_active = true
    `);

    // Total de checklists hoje
    const todayChecklists = await pool.query(`
      SELECT COUNT(*) as count FROM checklists 
      WHERE DATE(inspection_date) = CURRENT_DATE
    `);

    // Não conformidades do mês
    const monthlyNC = await pool.query(`
      SELECT COUNT(*) as count FROM checklists 
      WHERE inspection_status = 'NON_CONFORM' 
      AND EXTRACT(MONTH FROM inspection_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM inspection_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    // Horas de uso do mês
    const monthlyHours = await pool.query(`
      SELECT COALESCE(SUM(hours_of_use), 0) as total_hours FROM checklists 
      WHERE EXTRACT(MONTH FROM inspection_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM inspection_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    res.json({
      forklifts: forkliftsResult.rows[0],
      today_checklists: todayChecklists.rows[0].count,
      monthly_nc: monthlyNC.rows[0].count,
      monthly_hours: parseFloat(monthlyHours.rows[0].total_hours)
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUsageReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        f.serial_number,
        f.model,
        COUNT(c.id) as inspections_count,
        COALESCE(SUM(c.hours_of_use), 0) as total_hours,
        AVG(c.hours_of_use) as avg_hours_per_inspection
      FROM forklifts f
      LEFT JOIN checklists c ON f.id = c.forklift_id
      WHERE f.is_active = true
    `;

    const params = [];

    if (start_date && end_date) {
      query += ` AND c.inspection_date BETWEEN $1 AND $2`;
      params.push(start_date, end_date);
    }

    query += ` GROUP BY f.id, f.serial_number, f.model ORDER BY total_hours DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de uso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getNCReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Buscar itens mais frequentes com NC
    const result = await pool.query(`
      WITH nc_items AS (
        SELECT 
          (item_data->>'item') as item_name,
          COUNT(*) as nc_count
        FROM checklists c,
        LATERAL jsonb_array_elements(c.items_inspected->'B_physical_condition') AS item_data
        WHERE item_data->>'result' = 'NC'
        AND c.inspection_date BETWEEN $1 AND $2
        GROUP BY item_name
        
        UNION ALL
        
        SELECT 
          (item_data->>'item') as item_name,
          COUNT(*) as nc_count
        FROM checklists c,
        LATERAL jsonb_array_elements(c.items_inspected->'D_safety_systems') AS item_data
        WHERE item_data->>'result' = 'NC'
        AND c.inspection_date BETWEEN $1 AND $2
        GROUP BY item_name
      )
      SELECT item_name, SUM(nc_count) as total_nc
      FROM nc_items
      GROUP BY item_name
      ORDER BY total_nc DESC
      LIMIT 10
    `, [start_date || '2023-01-01', end_date || '2023-12-31']);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de NC:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
