import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/database.js';

// Importar rotas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import fleetRoutes from './routes/fleetRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar banco de dados
await initDatabase();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/reports', reportRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sistema de Check-list de Empilhadeiras' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Sistema de Check-list de Empilhadeiras - Fam Logística`);
  console.log(`👨‍💻 Desenvolvido por Aldemir Garbino com auxílio de IA`);
});
// Adicione esta linha no final do backend/index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... todo o seu código atual ...

// SERVE FRONTEND (Adicione estas linhas no FINAL)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Mantenha o app.listen existente
