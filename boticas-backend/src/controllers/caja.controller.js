import sql from 'mssql';
import { pool } from '../config/db.js';

/* ---------- LISTAR CAJAS ---------- */
export const listarCajas = async (_req, res, next) => {
  try {
    const r = await pool.query(`
      SELECT idCaja, Codigo, Descripcion, Responsable, Activo
      FROM Cajas
      ORDER BY Codigo
    `);
    res.json(r.recordset);
  } catch (e) {
    next(e);
  }
};

/* ---------- CREAR CAJA ---------- */
export const crearCaja = async (req, res, next) => {
  const { codigo, descripcion, responsable, idEmpresa } = req.body;
  console.log('Crear caja:', { codigo, descripcion, responsable, idEmpresa });
  try {
    const result = await pool.request()
      .input('cod', sql.VarChar(10), codigo)
      .input('desc', sql.VarChar(50), descripcion)
      .input('resp', sql.Int, responsable || null)
      .input('idE', sql.Int, idEmpresa)
      .query(`INSERT INTO Cajas (Codigo, Descripcion, Responsable, idEmpresa)
              OUTPUT INSERTED.idCaja
              VALUES (@cod, @desc, @resp, @idE)`);
    res.status(201).json({ message: 'Caja creada', idCaja: result.recordset[0].idCaja });
  } catch (err) {
    if (err.number === 2627) { err.status = 409; err.message = 'Código duplicado'; }
    next(err);
  }
};

/* Apertura de caja */
export const abrirCaja = async (req, res, next) => {
  const { idEmpresa, idCaja, saldoInicial } = req.body;
  const idUsuario = req.usuario.id;
  const result = await pool.request()
    .input('idE', sql.Int, idEmpresa)
    .input('idC', sql.Int, idCaja)
    .input('saldo', sql.Money, saldoInicial)
    .input('idUsu', sql.Int, idUsuario)
    .query(`INSERT INTO AperturaCajas
            (idEmpresa, idCaja, idUsuario, SaldoInicial, Estado)
            OUTPUT INSERTED.idApertura
            VALUES (@idE, @idC, @idUsu, @saldo, 'Abierta')`);
  res.json({ message: 'Caja abierta', idApertura: result.recordset[0].idApertura });
};

/* Registro de movimiento (venta, devolución, anulación) */
export const registrarMovimiento = async (req, res, next) => {
  const { idApertura, tipo, concepto, monto, moneda, referencia, idOrigen, tipoOrigen } = req.body;
  await pool.request()
    .input('idA', sql.Int, idApertura)
    .input('tipo', sql.Char(1), tipo)
    .input('concepto', sql.VarChar(100), concepto)
    .input('monto', sql.Money, monto)
    .input('moneda', sql.VarChar(3), moneda)
    .input('ref', sql.VarChar(50), referencia)
    .input('idO', sql.Int, idOrigen)
    .input('tipoO', sql.VarChar(20), tipoOrigen)
    .input('idUsu', sql.Int, req.usuario.id)
    .query(`INSERT INTO MovimientosCaja
            (idApertura, Tipo, Concepto, Monto, Moneda, Referencia, idOrigen, TipoOrigen, idUsuario)
            VALUES (@idA, @tipo, @concepto, @monto, @moneda, @ref, @idO, @tipoO, @idUsu)`);
  res.json({ message: 'Movimiento registrado' });
};

/* Cierre de caja */
export const cerrarCaja = async (req, res, next) => {
  const idApertura = Number(req.params.id);
  const ingresos = await pool.request()
    .input('idA', sql.Int, idApertura)
    .query(`SELECT SUM(Monto) AS ingresos FROM MovimientosCaja WHERE idApertura = @idA AND Tipo = 'I'`);
  const egresos = await pool.request()
    .input('idA', sql.Int, idApertura)
    .query(`SELECT SUM(Monto) AS egresos FROM MovimientosCaja WHERE idApertura = @idA AND Tipo = 'E'`);
  const saldoFinal = (ingresos.recordset[0].ingresos || 0) - (egresos.recordset[0].egresos || 0);
  await pool.request()
    .input('idA', sql.Int, idApertura)
    .input('saldo', sql.Money, saldoFinal)
    .query(`UPDATE AperturaCajas
            SET SaldoFinal = @saldo, Estado = 'Cerrada', FechaCierre = GETDATE()
            WHERE idApertura = @idA`);
  res.json({ message: 'Caja cerrada', saldoFinal });
};

/* Reporte de flujo de caja */
export const flujoCaja = async (req, res, next) => {
  const { idApertura } = req.query;
  const r = await pool.request()
    .input('idA', sql.Int, idApertura)
    .query(`
      SELECT mc.Fecha, mc.Concepto, mc.Monto, mc.Tipo, mc.Moneda, mc.Referencia
      FROM MovimientosCaja mc
      WHERE mc.idApertura = @idA
      ORDER BY mc.Fecha
    `);
  res.json(r.recordset);
};