import sql from 'mssql';
import { pool } from '../config/db.js';

/* ---------- LISTAR ---------- */
export const listarProductos = async (_req, res, next) => {
  try {
    const r = await pool.query(`
      SELECT p.*, c.Descripcion AS Categoria, m.Nombre AS Marca, l.Nombre AS Laboratorio,
             pr.Nombre AS Principio, pa.Descripcion AS Presentacion, v.Descripcion AS Via
      FROM Productos p
      LEFT JOIN Categorias c        ON p.idCategoria = c.idCategoria
      LEFT JOIN Marcas m            ON p.idMarca = m.idMarca
      LEFT JOIN Laboratorios l      ON p.idLaboratorio = l.idLaboratorio
      LEFT JOIN PrincipiosActivos pr ON p.idPrincipioActivo = pr.idPrincipioActivo
      LEFT JOIN Presentaciones pa   ON p.idPresentacion = pa.idPresentacion
      LEFT JOIN ViaAdministracion v ON p.idViaAdministracion = v.idVia
    `);
    console.log('lista de productos',r.recordset);
    res.status(200).send({ data: r.recordset });
  } catch (err) { 
    res.status(500).send({ message: 'Error al obtener los productos', data: undefined });
    next(err); 
  }
};

/* ---------- CREAR ---------- */
export const crearProducto = async (req, res, next) => {
  const {
    idEmpresa, codigo, codigoBarras, nombre, descripcion, idCategoria, idPresentacion, idMarca,
    idLaboratorio, idPrincipio, idVia, precioCompra, precioVenta, stockMin, stockMax,
    concentracion, forma, registroSanitario, digemid, requiereReceta, controlado
  } = req.body;

  console.log('crearProducto', req.body);
  try {
    const result = await pool.request()
      .input('idEmp', sql.Int, idEmpresa)
      .input('cod', sql.VarChar(20), codigo)
      .input('codBarras', sql.VarChar(50), codigoBarras)
      .input('nom', sql.VarChar(100), nombre)
      .input('desc', sql.VarChar(255), descripcion)
      .input('cat', sql.Int, idCategoria)
      .input('pres', sql.Int, idPresentacion)
      .input('mar', sql.Int, idMarca)
      .input('lab', sql.Int, idLaboratorio)
      .input('prin', sql.Int, idPrincipio)
      .input('via', sql.Int, idVia)
      .input('pc', sql.Money, precioCompra)
      .input('pv', sql.Money, precioVenta)
      .input('min', sql.Int, stockMin)
      .input('max', sql.Int, stockMax)
      .input('conc', sql.VarChar(20), concentracion)
      .input('forma', sql.VarChar(50), forma)
      .input('rs', sql.VarChar(50), registroSanitario)
      .input('dig', sql.VarChar(50), digemid)
      .input('rr', sql.Bit, requiereReceta)
      .input('ctrl', sql.Bit, controlado)
      .query(`INSERT INTO Productos
              (idEmpresa, Codigo, CodigoBarras, Nombre, Descripcion, idCategoria, idPresentacion,
               idMarca, idLaboratorio, idPrincipioActivo, idViaAdministracion,
               PrecioCompra, PrecioVenta, StockMin, StockMax,
               Concentracion, FormaFarmaceutica, RegistroSanitario, Digemid,
               RequiereReceta, Controlado, FechaIngreso, idUsuario, Activo)
              OUTPUT INSERTED.idProducto
              VALUES (@idEmp, @cod, @codbarras, @nom, @desc, @cat, @pres, @mar, @lab, @prin, @via,
                      @pc, @pv, @min, @max, @conc, @forma, @rs, @dig, @rr, @ctrl,
                      GETDATE(), @idEmp, 1)`);

    res.status(201).json({ message: 'Producto creado', idProducto: result.recordset[0].idProducto });
  } catch (err) {
    if (err.number === 2627) { err.status = 409; err.message = 'Código de producto ya existe'; }
    next(err);
  }
};

/* ---------- EDITAR ---------- */
export const editarProducto = async (req, res, next) => {
  console.log('editarProducto', req.params.id, req.body);
  const id = Number(req.params.id);
  const {
    Codigo, CodigoBarras, Nombre, Descripcion, idCategoria, idPresentacion, idMarca,
    idLaboratorio, idPrincipio, idVia, PrecioCompra, PrecioVenta, StockMin, StockMax,
    Concentracion, Forma, RegistroSanitario, Digemid, RequiereReceta, Controlado
  } = req.body;
  console.log('id', id);
  try {
    await pool.request()
        .input('id', sql.Int, id)
        .input('cod', sql.VarChar(20), Codigo)
        .input('codbarras', sql.VarChar(50), CodigoBarras)
        .input('nom', sql.VarChar(100), Nombre)
        .input('desc', sql.VarChar(255), Descripcion)
        .input('cat', sql.Int, idCategoria)
        .input('pres', sql.Int, idPresentacion)
        .input('mar', sql.Int, idMarca)
        .input('lab', sql.Int, idLaboratorio)
        .input('prin', sql.Int, idPrincipio)
        .input('via', sql.Int, idVia)
        .input('pc', sql.Money, PrecioCompra)
        .input('pv', sql.Money, PrecioVenta)
        .input('min', sql.Int, StockMin)
        .input('max', sql.Int, StockMax)
        .input('conc', sql.VarChar(20), Concentracion)
        .input('forma', sql.VarChar(50), Forma)
        .input('rs', sql.VarChar(50), RegistroSanitario)
        .input('dig', sql.VarChar(50), Digemid)
        .input('rr', sql.Bit, RequiereReceta)
        .input('ctrl', sql.Bit, Controlado)
        .query(`UPDATE Productos SET
                Codigo = COALESCE(@cod, Codigo),
                CodigoBarras = COALESCE(@codbarras, CodigoBarras),
                Nombre = COALESCE(@nom, Nombre),
                Descripcion = COALESCE(@desc, Descripcion),
                idCategoria = COALESCE(@cat, idCategoria),
                idPresentacion = COALESCE(@pres, idPresentacion),
                idMarca = COALESCE(@mar, idMarca),
                idLaboratorio = COALESCE(@lab, idLaboratorio),
                idPrincipioActivo = COALESCE(@prin, idPrincipioActivo),
                idViaAdministracion = COALESCE(@via, idViaAdministracion),
                PrecioCompra = COALESCE(@pc, PrecioCompra),
                PrecioVenta = COALESCE(@pv, PrecioVenta),
                StockMin = COALESCE(@min, StockMin),
                StockMax = COALESCE(@max, StockMax),
                Concentracion = COALESCE(@conc, Concentracion),
                FormaFarmaceutica = COALESCE(@forma, FormaFarmaceutica),
                RegistroSanitario = COALESCE(@rs, RegistroSanitario),
                Digemid = COALESCE(@dig, Digemid),
                RequiereReceta = COALESCE(@rr, RequiereReceta),
                Controlado = COALESCE(@ctrl, Controlado)
              WHERE idProducto = @id`);
      console.log('Producto actualizado', id);
    res.json({ message: 'Producto actualizado' });
  } catch (err) { 
    console.log(err);
    next(err); 
  }
};

/* ---------- SOFT DELETE ---------- */
export const eliminarProducto = async (req, res, next) => {
  const id = Number(req.params.id);
  console.log('eliminarProducto', id);
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Productos SET Activo = 0 WHERE idProducto = @id');
    res.json({ message: 'Producto desactivado', id });
  } catch (err) { next(err); }
};