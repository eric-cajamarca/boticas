import sql from 'mssql';
import { pool } from '../../config/db.js';

export const ventasRango = async (req, res, next) => {
  const { idEmpresa, desde, hasta } = req.query; // ISO 8601
  try {
    const r = await pool.request()
      .input('idE', sql.Int, idEmpresa)
      .input('d', sql.Date, desde)
      .input('h', sql.Date, hasta)
      .query(`
        SELECT v.idVenta, v.SerieNumero, v.FechaEmision,
               c.RazonSocial AS Cliente, v.Total
        FROM Ventas v
        JOIN Clientes c ON v.idCliente = c.idCliente
        WHERE v.idEmpresa = @idE
          AND v.FechaEmision BETWEEN @d AND @h
          AND v.Estado = 'Emitido'
        ORDER BY v.FechaEmision DESC
      `);
    res.json(r.recordset);
  } catch (e) { next(e); }
};