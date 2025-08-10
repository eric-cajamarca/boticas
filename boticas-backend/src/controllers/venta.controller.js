import sql from 'mssql';
import { pool } from '../config/db.js';

/* ---------- LISTAR VENTAS ---------- */
export const listarVentas = async (_req, res, next) => {
  try {
    const r = await pool.query(`
      SELECT v.*, c.RazonSocial AS Cliente, m.Codigo AS Moneda, tc.Nombre AS Comprobante
      FROM Ventas v
      JOIN Clientes c ON v.idCliente = c.idCliente
      JOIN Monedas m ON v.idMoneda = m.idMoneda
      JOIN TiposComprobante tc ON v.TipoComprobante = tc.Codigo
      ORDER BY v.FechaEmision DESC
    `);
    res.json(r.recordset);
  } catch (e) { next(e); }
};

/* ---------- CREAR VENTA + INVENTARIO ---------- */
export const crearVenta = async (req, res, next) => {
  const {
    idEmpresa,
    tipoComprobante,
    fechaEmision,
    fechaVencimiento,
    idCliente,
    idMoneda,
    idCondicionPago,
    tipoCambio,
    subTotal,
    descuentoGlobal = 0,
    igv,
    otrosCargos = 0,
    total,
    detalle, // [{idProducto, idLote, cantidad, precioUnitario, descuento, igv}]
    observaciones = ''
  } = req.body;

  const idUsu = req.usuario.id;
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    /* 1. Cliente (crear si no existe) */
    let idCli = idCliente;
    if (!idCliente) {
      // const cli = await tx.request()
      //   .input('td', sql.Char(2), '01')
      //   .input('nd', sql.VarChar(12), '00000000')
      //   .input('rs', sql.VarChar(200), 'Cliente Final')
      //   .input('correo', sql.VarChar(100), 'final@venta.com')
      //   .query(`INSERT INTO Clientes
      //           (TipoDocumento, NumeroDocumento, RazonSocial, Correo, FechaRegistro, Activo)
      //           OUTPUT INSERTED.idCliente
      //           VALUES (@td, @nd, @rs, @correo, GETDATE(), 1)`);
      // idCli = cli.recordset[0].idCliente;
    }

    /* 2. Generar número de comprobante */
    

    const serie = 'B001'; // ya lo decides
    const num = await tx.request()
      .input('idE', sql.Int, idEmpresa)
      .input('s', sql.VarChar(4), serie)
      .query(`SELECT NumeroActual FROM NumeracionComprobantes
              WHERE idEmpresa = @idE AND Serie = @s`);
    const numActual = num.recordset[0].NumeroActual.toString().padStart(8, '0');

    /* 3. Venta cabecera */
    const venta = await tx.request()
      .input('idE', sql.Int, idEmpresa)
      .input('tc', sql.Char(2), tipoComprobante)
      .input('s', sql.VarChar(4), serie)
      .input('n', sql.VarChar(8), numActual)
      .input('fe', sql.Date, fechaEmision)
      .input('fv', sql.Date, fechaVencimiento)
      .input('idC', sql.Int, idCli)
      .input('idM', sql.Int, idMoneda)
      .input('idCP', sql.Int, idCondicionPago)
      .input('tcam', sql.Decimal(10, 3), tipoCambio)
      .input('st', sql.Money, subTotal)
      .input('dg', sql.Money, descuentoGlobal)
      .input('igv', sql.Money, igv)
      .input('oc', sql.Money, otrosCargos)
      .input('tot', sql.Money, total)
      .input('obs', sql.VarChar(200), observaciones)
      .input('idUsu', sql.Int, idUsu)
      .query(`INSERT INTO Ventas
          (idEmpresa, TipoComprobante, Serie, Numero, FechaEmision, FechaVencimiento,
           idCliente, idMoneda, idCondicionPago, TipoCambio,
           SubTotal, DescuentoGlobal, Igv, OtrosCargos, Total,
           Estado, Comentarios, FechaCreacion, idUsuario)
          VALUES (@idE, @tc, @s, @n, @fe, @fv, @idC, @idM, @idCP, @tcam,
                  @st, @dg, @igv, @oc, @tot, 'Emitido', @obs, GETDATE(), @idUsu);
          SELECT SCOPE_IDENTITY() AS idVenta`);

    const idVenta = venta.recordset[0].idVenta;
    const serieNumero = `${serie}-${numActual}`;

    //crear cuentas por cobrar
      // Dentro de crearVenta
      if (idCondicionPago !== 1) {
        // calcular fechaVencimiento igual que arriba
        const dias = await tx.request()
        .input('idCP', sql.Int, idCondicionPago)
        .query('SELECT DiasCredito FROM CondicionesPago WHERE idCondicionPago = @idCP');
        const diasCredito = dias.recordset[0].DiasCredito;
        const fechaVencimiento = new Date(fechaEmision);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + diasCredito);

        
        await tx.request()
          .input('idE', sql.Int, idEmpresa)
          .input('idVenta', sql.Int, idVenta)
          .input('numLetra', sql.VarChar(20), serieNumero)
          .input('fE', sql.Date, fechaEmision) // ← declarada
          .input('fv', sql.Date, fechaVencimiento)
          .input('tot', sql.Money, total)
          .input('idMda', sql.Int, idMoneda)
          .input('tc', sql.Decimal(10, 3), tipoCambio)
          .input('idUsu', sql.Int, idUsu)
          .query(`INSERT INTO CuentasPorCobrar
                  (idEmpresa, idVenta, NumeroLetra, FechaEmision, FechaVencimiento,
                  MontoTotal, SaldoActual, idMoneda, tipoCambio, Estado, idUsuario)
                  VALUES (@idE, @idVenta, @numLetra, @fE, @fv, @tot, @tot, @idMda, @tc,'Pendiente', @idUsu)`);
      }


    /* 4. Detalle + Inventario (salidas) */
    for (let i = 0; i < detalle.length; i++) {
      const { idProducto, idLote, cantidad, precioUnitario, descuento, igv, isc, total} = detalle[i];
      // const igvDet = ((precioUnitario * cantidad) - descuento) * 0.18;

      await tx.request()
        .input('idV', sql.Int, idVenta)
        .input('item', sql.Int, i + 1)
        .input('idP', sql.Int, idProducto)
        .input('idL', sql.Int, idLote)
        .input('cant', sql.Int, cantidad)
        .input('pu', sql.Money, precioUnitario)
        .input('d', sql.Money, descuento)
        .input('igv', sql.Money, igv)
        .input('isc', sql.Money, isc)
        .input('tot', sql.Money, total)
        .query(`INSERT INTO DetalleVentas
                (idVenta, Item, idProducto, idLote, Cantidad, PrecioUnitario, Descuento, Igv, Isc, Total)
                VALUES (@idV, @item, @idP, @idL, @cant, @pu, @d, @igv, @isc, @tot)`);

      // Inventario (salida)
      await tx.request()
        .input('idP', sql.Int, idProducto)
        .input('idL', sql.Int, idLote)
        .input('cant', sql.Int, -cantidad) // negativo
        .input('idU', sql.Int, detalle[i].idUbicacion || 1)
        .input('idUsu', sql.Int, idUsu)
        .input('idV', sql.Int, idVenta)
        .query(`INSERT INTO Inventario
                (idProducto, idLote, Tipo, Cantidad, idUbicacion, Fecha, idUsuario,
                 Observacion, TipoOrigen, idOrigen)
                VALUES (@idP, @idL, 'O', @cant, @idU, GETDATE(), @idUsu,
                        'Venta emitida', 'VENTA', @idV)`);


      
    }

    await tx.commit();
    res.status(201).json({ message: 'Venta registrada', idVenta, numero: serie + '-' + numActual });
  } catch (err) {
    await tx.rollback();
    next(err);
  }
};

/* ---------- ANULAR VENTA (soft + reversión) ---------- */
export const anularVenta = async (req, res, next) => {
  const idVenta = Number(req.params.id);
  const idUsu = req.usuario.id;

  const tx = new sql.Transaction(pool);
  try {
    await tx.begin();

    // 1. Estado anulado
    await tx.request()
      .input('id', sql.Int, idVenta)
      .query(`UPDATE Ventas SET Estado = 'Anulado' WHERE idVenta = @id`);

    // 2. Revertir inventario
    await tx.request()
      .input('id', sql.Int, idVenta)
      .input('idUsu', sql.Int, idUsu)
      .query(`INSERT INTO Inventario
              (idProducto, idLote, Tipo, Cantidad, idUbicacion, Fecha, idUsuario,
               Observacion, TipoOrigen, idOrigen)
              SELECT dv.idProducto,
                     dv.idLote,
                     'A',
                     dv.Cantidad,       -- positivo (devolución)
                     l.idUbicacion,
                     GETDATE(),
                     @idUsu,
                     'Anulación venta ' + CAST(@id AS VARCHAR),
                     'VENTA',
                     @id
              FROM DetalleVentas dv
              JOIN Lotes l ON l.idLote = dv.idLote
              WHERE dv.idVenta = @id`);

    await tx.commit();
    res.json({ message: 'Venta anulada y stock revertido', idVenta });
  } catch (err) {
    await tx.rollback();
    next(err);
  }
};