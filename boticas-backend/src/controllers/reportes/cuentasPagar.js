import sql from 'mssql';
import { pool } from '../../config/db.js';

export const cuentasPagar = async (req, res, next) => {
  const { idEmpresa } = req.query;
  try {
    const r = await pool.request()
      .input('idE', sql.Int, idEmpresa)
      .query(`
        SELECT c.idCuentaPorPagar, comp.SerieNumero, c.MontoTotal, c.SaldoActual,
               pro.RazonSocial, c.FechaVencimiento
        FROM CuentasPorPagar c
        JOIN Compras comp ON c.idCompra = comp.idCompra
        JOIN Proveedores pro ON comp.idProveedor = pro.idProveedor
        WHERE c.idEmpresa = @idE AND c.SaldoActual > 0
        ORDER BY c.FechaVencimiento
      `);
    res.json(r.recordset);
  } catch (e) { next(e); }
};