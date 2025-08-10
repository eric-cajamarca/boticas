import sql from 'mssql';
import { pool } from '../../config/db.js';

export const vencimientoLotes = async (req, res, next) => {
  const { dias = 30 } = req.query; // por defecto 30 días
  const limite = new Date();
  limite.setDate(limite.getDate() + Number(dias));

  try {
    const r = await pool.request()
      .input('limite', sql.Date, limite)
      .query(`
        SELECT p.Nombre, l.NumeroLote, l.FechaVencimiento,
               SUM(i.Cantidad * CASE WHEN i.Tipo = 'I' THEN 1 ELSE -1 END) AS StockRestante
        FROM Lotes l
        JOIN Productos p ON l.idProducto = p.idProducto
        JOIN Inventario i ON l.idLote = i.idLote
        WHERE l.FechaVencimiento <= @limite
        GROUP BY p.Nombre, l.NumeroLote, l.FechaVencimiento
        HAVING SUM(i.Cantidad * CASE WHEN i.Tipo = 'I' THEN 1 ELSE -1 END) > 0
        ORDER BY l.FechaVencimiento
      `);
    res.json(r.recordset);
  } catch (e) { next(e); }
};