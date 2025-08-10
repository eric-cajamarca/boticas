import sql from 'mssql';
import { pool } from '../../config/db.js';

export const cuentasPagar = async (req, res, next) => {
  const { idEmpresa } = req.query;
  try {
    const r = await pool.request()
      .input('idE', sql.Int, idEmpresa)
      .query(`
        SELECT c.idCuentaPorPagar, v.SerieNumero, c.MontoTotal, c.SaldoActual,
               cli.RazonSocial, c.FechaVencimiento
        FROM CuentasPorPagar c
        JOIN Ventas v ON c.idVenta = v.idVenta
        JOIN Clientes cli ON v.idCliente = cli.idCliente
        WHERE c.idEmpresa = @idE AND c.SaldoActual > 0
        ORDER BY c.FechaVencimiento
      `);
    res.json(r.recordset);
  } catch (e) { next(e); }
};