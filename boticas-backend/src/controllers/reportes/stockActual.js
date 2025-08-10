import sql from 'mssql';
import { pool } from '../../config/db.js';

export const stockActual = async (req, res, next) => {
  const { idEmpresa } = req.query; // obligatorio
  try {
    const r = await pool.request()
      .input('idE', sql.Int, idEmpresa)
      .query(`
        SELECT p.idProducto, p.Codigo, p.Nombre, p.StockMin, p.StockMax,
               l.NumeroLote, l.FechaVencimiento,
               u.Codigo AS Ubicacion,
               SUM(i.Cantidad * CASE WHEN i.Tipo = 'I' THEN 1 ELSE -1 END) AS Stock
        FROM Inventario i
        JOIN Productos  p ON i.idProducto = p.idProducto
        JOIN Lotes      l ON i.idLote    = l.idLote
        LEFT JOIN Ubicaciones u ON l.idUbicacion = u.idUbicacion
        WHERE p.idEmpresa = @idE
        GROUP BY p.idProducto, p.Codigo, p.Nombre, p.StockMin, p.StockMax,
                 l.NumeroLote, l.FechaVencimiento, u.Codigo
        HAVING SUM(i.Cantidad * CASE WHEN i.Tipo = 'I' THEN 1 ELSE -1 END) > 0
        ORDER BY p.Nombre, u.Codigo
      `);
    res.json(r.recordset);
  } catch (e) { next(e); }
};