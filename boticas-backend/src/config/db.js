import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME,
  options: { encrypt: false,
             trustServerCertificate: true 
          },
  // pool: { max: 10, min: 0 },
};

export let pool;

export async function connectDB() {
  pool = await sql.connect(config);
  console.log('✅ SQL Server conectado');
}
