import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'forklift_checklist',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

export const initDatabase = async () => {
  try {
    // Criar tabelas se não existirem
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        role VARCHAR(20) CHECK (role IN ('OPERATOR', 'ADMINISTRATOR')) NOT NULL,
        authorized_forklifts JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS forklifts (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        model VARCHAR(100) NOT NULL,
        capacity DECIMAL(10,2) NOT NULL,
        current_status VARCHAR(20) CHECK (current_status IN ('IN_SERVICE', 'OUT_OF_SERVICE')) DEFAULT 'IN_SERVICE',
        last_horimeter DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS checklists (
        id SERIAL PRIMARY KEY,
        forklift_id INTEGER REFERENCES forklifts(id),
        operator_id INTEGER REFERENCES users(id),
        inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        initial_horimeter DECIMAL(10,2) NOT NULL,
        final_horimeter DECIMAL(10,2),
        hours_of_use DECIMAL(10,2),
        inspection_status VARCHAR(20) CHECK (inspection_status IN ('CONFORM', 'NON_CONFORM')) NOT NULL,
        digital_signature TEXT,
        is_synchronized BOOLEAN DEFAULT true,
        items_inspected JSONB NOT NULL,
        safety_stop_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inserir usuário admin padrão se não existir
    const adminCheck = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, name, registration_number, role) VALUES ($1, $2, $3, $4, $5)',
        ['admin', hashedPassword, 'Administrador', 'ADM001', 'ADMINISTRATOR']
      );
      console.log('Usuário admin criado: admin / admin123');
    }

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

export default pool;
