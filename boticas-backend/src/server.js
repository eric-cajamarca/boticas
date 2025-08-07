import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.js';
import empresaRoutes from './routes/empresa.routes.js';
import empleadoRoutes from './routes/empleado.routes.js';


dotenv.config();
await connectDB();                 // conecta SQL Server

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.FRONT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate-limit global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200
});
app.use(limiter);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/admin/empleados', empleadoRoutes);
// app.get('/api/empresas/ping', (_req, res) => {
//   console.log('>>> /api/empresas/ping fue llamado');
//   res.json({ ping: 'ok' });
// });
// Health-check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Manejo de errores centralizado
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server en puerto ${PORT}`));