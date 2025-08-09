import sql from 'mssql';
import { pool } from '../config/db.js';

/* ---------- LISTAR LOTES ---------- */
export const listarLotes = async (_req, res, next) => {
  try {
    const r = await pool.query(`
      SELECT l.*, p.Nombre AS Producto, u.Codigo AS Ubicacion
      FROM Lotes l
      JOIN Productos p ON l.idProducto = p.idProducto
      LEFT JOIN (
        SELECT i.idLote, i.idUbicacion
        FROM Inventario i
        WHERE i.Fecha = (
          SELECT MAX(Fecha) FROM Inventario WHERE idLote = i.idLote
        )
      ) inv ON l.idLote = inv.idLote
      LEFT JOIN Ubicaciones u ON inv.idUbicacion = u.idUbicacion
    `);
    // const r = await pool.query(`
    //   SELECT l.*, p.Nombre AS Producto, u.Codigo AS Ubicacion
    //   FROM Lotes l
    //   JOIN Productos p ON l.idProducto = p.idProducto
    //   LEFT JOIN Ubicaciones u ON l.idUbicacion = u.idUbicacion
    // `);
    res.json(r.recordset);
  } catch (err) { next(err); }
};

/* ---------- CREAR LOTE + INGRESO INICIAL ---------- */
export const crearLote = async (req, res, next) => {
  const {
    idProducto, numeroLote, fechaFabricacion, fechaVencimiento, cantidad,
    estado, tipo, observaciones, idUbicacion, referencia, idOrigen, tipoOrigen
  } = req.body;

  console.log('>>> Crear lote:', req.body);
  const idUsu = req.usuario.id; // from autenticar middleware
  const tx = new sql.Transaction(pool);
  try {
    await tx.begin();

    // 1. Lote
    const lote = await tx.request()
    .input('idP', sql.Int, idProducto)
    .input('nl', sql.VarChar(50), numeroLote)
    .input('ff', sql.Date, fechaFabricacion)
    .input('fv', sql.Date, fechaVencimiento)
    .input('cant', sql.Int, cantidad)
    .input('est', sql.VarChar(20), estado)
    .input('obs', sql.VarChar(200), observaciones)
    .input('idU', sql.Int, idUbicacion)          // <-- añadido
    .input('idUsu', sql.Int, idUsu)
    .query(`INSERT INTO Lotes
            (idProducto, NumeroLote, FechaFabricacion, FechaVencimiento, Cantidad,
            Estado, Observaciones, FechaRegistro, idUsuario, idUbicacion)
            OUTPUT INSERTED.idLote
            VALUES (@idP, @nl, @ff, @fv, @cant, @est, @obs, GETDATE(), @idUsu, @idU)`);

    const idLote = lote.recordset[0].idLote;

    console.log('>>> Nuevo lote creado con idLote =', idLote);

    // 2. Inventario (ingreso inicial)
    await tx.request()
      .input('idP', sql.Int, idProducto)
      .input('idL', sql.Int, idLote)
      .input('tipo', sql.VarChar(20), tipo || 'Ingreso')
      .input('cant', sql.Int, cantidad)
      .input('idU', sql.Int, idUbicacion)
      .input('idUsu', sql.Int, idUsu)
      .input('obs', sql.VarChar(200), observaciones || null)
      .input('ref', sql.VarChar(100), referencia || null)
      .input('idO', sql.Int, idOrigen || null)
      .input('tipoO', sql.VarChar(50), tipoOrigen || null)
      .query(`INSERT INTO Inventario
              (idProducto, idLote, Tipo, Cantidad, idUbicacion, Fecha, idUsuario,
              Observacion, Referencia, idOrigen, TipoOrigen) 
                VALUES (@idP, @idL, @tipo, @cant, @idU, GETDATE(), @idUsu, @obs, @ref, @idO, @tipoO)`);
    await tx.commit();
    res.status(201).json({ message: 'Lote creado e ingresado', idLote });
  } catch (err) {
    await tx.rollback();
    if (err.number === 2627) { err.status = 409; err.message = 'Lote duplicado'; }
    next(err);
  }
};

/* ---------- EDITAR LOTE ---------- */
export const editarLote = async (req, res, next) => {
  const id = Number(req.params.id);
  const { idProducto, numeroLote, fechaFabricacion, fechaVencimiento, cantidad,
    estado, observaciones, idUbicacion } = req.body;
  const idUsu = req.usuario.id; // from autenticar middleware
  
  await pool.request()
    .input('id', sql.Int, id)
    .input('idP', sql.Int, idProducto)
    .input('nl', sql.VarChar(50), numeroLote)
    .input('ff', sql.Date, fechaFabricacion)
    .input('fv', sql.Date, fechaVencimiento)
    .input('cant', sql.Int, cantidad)
    .input('est', sql.VarChar(20), estado)
    .input('obs', sql.VarChar(200), observaciones)
    .input('idU', sql.Int, idUbicacion)
    .input('idUsu', sql.Int, idUsu)
    .query(`UPDATE Lotes SET
            idProducto = @idP, NumeroLote = @nl, FechaFabricacion = @ff,
            FechaVencimiento = @fv, Cantidad = @cant, Estado = @est,
            Observaciones = @obs, idUsuario = @idUsu, idUbicacion = @idU
            WHERE idLote = @id`);
  res.json({ message: 'Lote actualizado' });
};

/* ---------- ELIMINAR LOTE (solo si no tiene movimientos) ---------- */
export const eliminarLote = async (req, res, next) => {
  const id = Number(req.params.id);
  const count = await pool.request().input('id', sql.Int, id).query(
    'SELECT COUNT(*) AS c FROM Inventario WHERE idLote = @id');
  if (count.recordset[0].c > 0) {
    return res.status(409).json({ message: 'Lote tiene movimientos, no se puede eliminar' });
  }
  await pool.request().input('id', sql.Int, id).query('DELETE FROM Lotes WHERE idLote = @id');
  res.json({ message: 'Lote eliminado' });
};