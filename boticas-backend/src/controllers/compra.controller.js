import sql from 'mssql';
import { pool } from '../config/db.js';

/* ---------- LISTAR ---------- */
export const listarCompras = async (_req, res, next) => {
  try {
    const r = await pool.query(`
      SELECT c.*, p.RazonSocial AS Proveedor, m.Codigo AS Moneda
      FROM Compras c
      JOIN Proveedores p ON c.idProveedor = p.idProveedor
      JOIN Monedas m ON c.idMoneda = m.idMoneda
      ORDER BY c.FechaEmision DESC
    `);
    res.json(r.recordset);
  } catch (e) { next(e); }
};

/* ---------- CREAR COMPRA + LOTES + INVENTARIO ---------- */
export const crearCompra = async (req, res, next) => {
  const {
    idEmpresa,
    tipoDocumento,
    serie,
    numero,
    fechaEmision,
    fechaVencimiento,
    idProveedor,
    idMoneda,
    idCondicionPago,
    tipoCambio,
    subTotal,
    descuentoGlobal = 0,
    igv,
    isc,
    otrosCargos = 0,
    total,
    detalle,          // [{ idProducto, cantidad, precioUnitario, descuento, numeroLote, fechaVencimiento, idUbicacion }]
    observaciones,
  } = req.body;

  const idUsu = req.usuario.id;
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    // 1. Compra cabecera
    const compra = await tx.request()
      .input('idE', sql.Int, idEmpresa)
      .input('td', sql.Char(2), tipoDocumento)
      .input('s', sql.VarChar(4), serie)
      .input('n', sql.VarChar(8), numero)
      .input('fe', sql.Date, fechaEmision)
      .input('fv', sql.Date, fechaVencimiento)
      .input('idP', sql.Int, idProveedor)
      .input('idM', sql.Int, idMoneda)
      .input('tc', sql.Decimal(10, 3), tipoCambio)
      .input('st', sql.Money, subTotal)
      .input('dg', sql.Money, descuentoGlobal)
      .input('igv', sql.Money, igv)
      .input('isc', sql.Money, isc)
      .input('oc', sql.Money, otrosCargos)
      .input('tot', sql.Money, total)
      .input('obs', sql.VarChar(200), observaciones)
      .input('idUsu', sql.Int, idUsu)
      .input('idCp', sql.Int, idCondicionPago) // Condición de pago por defecto (Contado)
      .query(`INSERT INTO Compras
              (idEmpresa, TipoDocumento, Serie, Numero, FechaEmision, FechaVencimiento,
               idProveedor, idMoneda, TipoCambio, SubTotal, DescuentoGlobal, Igv, isc,
               OtrosCargos, Total, Estado, Comentarios, FechaCreacion, idUsuario, idCondicionPago)
              OUTPUT INSERTED.idCompra
              VALUES (@idE, @td, @s, @n, @fe, @fv, @idP, @idM, @tc, @st, @dg,
                      @igv, @isc, @oc, @tot, 'Pendiente', @obs, GETDATE(), @idUsu, @idCp)`);

    const idCompra = compra.recordset[0].idCompra;
    const serieNumero = `${serie}-${numero}`;

    // crear cuentas por cobrar
      // Después de insertar la compra
      if (idCondicionPago !== 1) { // 1 = Contado
        const dias = await tx.request()
          .input('idCP', sql.Int, idCondicionPago)
          .query('SELECT DiasCredito FROM CondicionesPago WHERE idCondicionPago = @idCP');
        console.log('Dias de credito:', dias.recordset[0]);
        const diasCredito = dias.recordset[0].DiasCredito;
        const fechaVencimiento = new Date(fechaEmision);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + diasCredito);

        await tx.request()
          .input('idE', sql.Int, idEmpresa)
          .input('idCompra', sql.Int, idCompra)
          .input('numLetra', sql.VarChar(20), serieNumero)
          .input('fechaEmision', sql.Date, fechaEmision) // ← declarada
          .input('fv', sql.Date, fechaVencimiento)
          .input('tot', sql.Money, total)
          .input('idMda', sql.Int, idMoneda)
          .input('tc', sql.Decimal(10, 3), tipoCambio)
          .input('idUsu', sql.Int, idUsu)
          .query(`INSERT INTO CuentasPorPagar
                  (idEmpresa, idCompra, numeroLetra, FechaEmision, FechaVencimiento,
                  MontoTotal, SaldoActual, idMoneda, tipoCambio, Estado, idUsuario)
                  VALUES (@idE, @idCompra, @numLetra ,@fechaEmision, @fv, @tot, @tot, @idMda, @tc,'Pendiente', @idUsu)`);
      }


    // 2. Detalle + Lotes + Inventario
    for (let i = 0; i < detalle.length; i++) {
        const {
            idProducto, codigo, nombre, descripcion,
            idCategoria, idPresentacion, idMarca, idLaboratorio, idPrincipio, idVia,
            precioUnitario, precioVenta, concentracion, forma,
            cantidad, descuento, igv, isc, total, numeroLote, fechaVencimiento, idUbicacion, idCondicionPago
        } = detalle[i];
 

    let idProd = idProducto;
   

        // 2.0 Crear / actualizar producto
        if (!idProducto) {
            const prod = await tx.request()
            .input('cod', sql.VarChar(20), codigo)
            .query('SELECT idProducto FROM Productos WHERE Codigo = @cod');
            if (prod.recordset.length) {
            idProd = prod.recordset[0].idProducto;
            } else {
            const newProd = await tx.request()
                .input('idE', sql.Int, idEmpresa)
                .input('cod', sql.VarChar(20), codigo)
                .input('nom', sql.VarChar(100), nombre)
                .input('desc', sql.VarChar(255), descripcion)
                .input('cat', sql.Int, idCategoria)
                .input('pres', sql.Int, idPresentacion)
                .input('mar', sql.Int, idMarca)
                .input('lab', sql.Int, idLaboratorio)
                .input('prin', sql.Int, idPrincipio)
                .input('via', sql.Int, idVia)
                .input('pc', sql.Money, precioUnitario)
                .input('pv', sql.Money, precioVenta)
                .input('conc', sql.VarChar(20), concentracion)
                .input('forma', sql.VarChar(50), forma)
                .input('us', sql.Int, idUsu)
                .query(`INSERT INTO Productos
                        (idEmpresa, Codigo, Nombre, Descripcion, idCategoria,
                        idPresentacion, idMarca, idLaboratorio, idPrincipioActivo,
                        idViaAdministracion, PrecioCompra, PrecioVenta,
                        Concentracion, FormaFarmaceutica, FechaIngreso, idUsuario, Activo)
                        OUTPUT INSERTED.idProducto
                        VALUES (@idE, @cod, @nom, @desc, @cat, @pres, @mar, @lab,
                                @prin, @via, @pc, @pv, @conc, @forma, GETDATE(), @us, 1)`);
            idProd = newProd.recordset[0].idProducto;
            }
        }


      // 2.1 Insertar lote (igual que antes, pero con idProd calculado)
      const lote = await tx.request()
        .input('idP', sql.Int, idProd)
        .input('nl', sql.VarChar(50), numeroLote)
        .input('fv', sql.Date, fechaVencimiento)
        .input('cant', sql.Int, cantidad)
        .input('idU', sql.Int, idUbicacion)
        .input('idUsu', sql.Int, idUsu)
       

        .query(`INSERT INTO Lotes
                (idProducto, NumeroLote, FechaVencimiento, Cantidad, Estado,
                 FechaRegistro, idUsuario, idUbicacion)
                OUTPUT INSERTED.idLote
                VALUES (@idP, @nl, @fv, @cant, 'Disponible', GETDATE(), @idUsu, @idU)`);

      const idLote = lote.recordset[0].idLote;

      // 2.2 Detalle de compra
      const igvDetalle = (precioUnitario * cantidad * 0.18);
      await tx.request()
        .input('idC', sql.Int, idCompra)
        .input('item', sql.Int, i + 1)
        .input('idP', sql.Int, idProd)
        .input('cant', sql.Int, cantidad)
        .input('pu', sql.Money, precioUnitario)
        .input('d', sql.Money, descuento)
        .input('igv', sql.Money, igvDetalle)
        .input('isc', sql.Money, isc)
        .input('total', sql.Money, total)
        .query(`INSERT INTO DetalleCompras
                (idCompra, Item, idProducto, Cantidad, PrecioUnitario, Descuento, Igv, Isc, Total)
                VALUES (@idC, @item, @idP, @cant, @pu, @d, @igv, @isc, @total)`);

      // 2.3 Inventario (ingreso)
      await tx.request()
        .input('idP', sql.Int, idProd)
        .input('idL', sql.Int, idLote)
        .input('cant', sql.Int, cantidad)
        .input('idU', sql.Int, idUbicacion)
        .input('idUsu', sql.Int, idUsu)
        .input('idO', sql.Int, idCompra)
        .query(`INSERT INTO Inventario
                (idProducto, idLote, Tipo, Cantidad, idUbicacion, Fecha, idUsuario,
                 Observacion, TipoOrigen, idOrigen)
                VALUES (@idP, @idL, 'I', @cant, @idU, GETDATE(), @idUsu,
                        'Ingreso por compra', 'COMPRA', @idO)`);

      


    }

    await tx.commit();
    res.status(201).json({ message: 'Compra registrada', idCompra });
  } catch (err) {
    await tx.rollback();
    next(err);
  }
};

/* ---------- ANULAR COMPRA (soft + reversión de inventario) ---------- */
export const anularCompra = async (req, res, next) => {
  const idCompra = Number(req.params.id);
  const idUsu    = req.usuario.id;

  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    // 1. Marcar compra como Anulada
    await tx.request()
      .input('id', sql.Int, idCompra)
      .query(`UPDATE Compras SET Estado = 'Anulado' WHERE idCompra = @id`);

    // 2. Reversión de inventario (una fila por cada línea)
    await tx.request()
      .input('id', sql.Int, idCompra)
      .input('idUsu', sql.Int, idUsu)
      .query(`INSERT INTO Inventario
              (idProducto, idLote, Tipo, Cantidad, idUbicacion, Fecha, idUsuario,
               Observacion, TipoOrigen, idOrigen)
              SELECT dc.idProducto,
                     l.idLote,
                     'A',
                     -dc.Cantidad,
                     l.idUbicacion,
                     GETDATE(),
                     @idUsu,
                     'Anulación compra ' + CAST(@id AS VARCHAR),
                     'COMPRA',
                     @id
              FROM DetalleCompras dc
              JOIN Lotes l
                ON l.idProducto = dc.idProducto
               AND l.NumeroLote = dc.NumeroLote
              WHERE dc.idCompra = @id`);

    await tx.commit();
    res.json({ message: 'Compra anulada y stock revertido', idCompra });
  } catch (err) {
    await tx.rollback();
    next(err);
  }
};