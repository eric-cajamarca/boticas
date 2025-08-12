import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { generalLimiter, loginLimiter } from './middlewares/rateLimiter.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.js';
import empresaRoutes from './routes/empresa.routes.js';
import empleadoRoutes from './routes/empleado.routes.js';
import maestroRoutes from './routes/maestro.routes.js';
import productoRoutes from './routes/producto.routes.js';
import loteRoutes from './routes/lote.routes.js';
import compraRoutes from './routes/compra.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import reportesRoutes  from './routes/reportes.routes.js';
import cajaRoutes from './routes/caja.routes.js';

dotenv.config();
await connectDB();                 // conecta SQL Server

const app = express();
app.use(helmet());
// CORS restrictiva
const allowedOrigins = [
  'http://localhost:5173',      // dev
  'https://mi-dominio.com'      // prod
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido'));
    }
  },
  credentials: true
}));
// Middleware
// app.use(express.urlencoded({ extended: true })); // para formularios
app.use(express.json());
app.use(cookieParser());

// Rate-limit
app.use(generalLimiter);                 // afecta a TODAS las rutas
app.use('/api/auth/login', loginLimiter); // solo a login

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin/empresas', empresaRoutes);
app.use('/api/admin/empleados', empleadoRoutes);
app.use('/api/admin', maestroRoutes);
app.use('/api/admin/productos', productoRoutes);
app.use('/api/admin/lotes', loteRoutes);
app.use('/api/admin/compras', compraRoutes);
app.use('/api/admin/ventas', ventaRoutes);
app.use('/api/admin/proveedores', proveedorRoutes);
app.use('/api/admin/clientes',    clienteRoutes);
app.use('/api/reports', reportesRoutes);
app.use('/api/admin/caja', cajaRoutes);
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