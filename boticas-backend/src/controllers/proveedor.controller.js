import sql from 'mssql';
import { pool } from '../config/db.js';

/* ---------- LISTAR ---------- */
export const listarProveedores = async (_req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM Proveedores WHERE Activo = 1 ORDER BY RazonSocial');
    res.json(r.recordset);
  } catch (e) { next(e); }
};

/* ---------- CREAR ---------- */
export const crearProveedor = async (req, res, next) => {
  const {
    tipoDocumento, numeroDocumento, razonSocial, nombreComercial,
    direccion, ubigeo, distrito, provincia, departamento,
    telefono, celular, correo, tipoProveedor, contacto
  } = req.body;

  try {
    const result = await pool.request()
      .input('td', sql.Char(2), tipoDocumento)
      .input('nd', sql.VarChar(12), numeroDocumento)
      .input('rs', sql.VarChar(200), razonSocial)
      .input('nc', sql.VarChar(200), nombreComercial)
      .input('dir', sql.VarChar(200), direccion)
      .input('ub', sql.Char(6), ubigeo)
      .input('dis', sql.VarChar(50), distrito)
      .input('prov', sql.VarChar(50), provincia)
      .input('dep', sql.VarChar(50), departamento)
      .input('tel', sql.VarChar(15), telefono)
      .input('cel', sql.VarChar(15), celular)
      .input('mail', sql.VarChar(100), correo)
      .input('tp', sql.VarChar(50), tipoProveedor)
      .input('cont', sql.VarChar(100), contacto)
      .query(`INSERT INTO Proveedores
              (TipoDocumento, NumeroDocumento, RazonSocial, NombreComercial,
               Direccion, Ubigeo, Distrito, Provincia, Departamento,
               Telefono, Celular, Correo, TipoProveedor, Contacto,
               FechaRegistro, Activo)
              OUTPUT INSERTED.idProveedor
              VALUES (@td, @nd, @rs, @nc, @dir, @ub, @dis, @prov, @dep,
                      @tel, @cel, @mail, @tp, @cont, GETDATE(), 1)`);
    res.status(201).json({ message: 'Proveedor creado', idProveedor: result.recordset[0].idProveedor });
  } catch (err) {
    if (err.number === 2627) { err.status = 409; err.message = 'Documento duplicado'; }
    next(err);
  }
};

/* ---------- EDITAR ---------- */
export const editarProveedor = async (req, res, next) => {
  const id = Number(req.params.id);
  const {
    razonSocial, nombreComercial, direccion, ubigeo, distrito, provincia, Departamento, telefono, celular, correo,
    tipoProveedor, contacto
  } = req.body;
  await pool.request()
    .input('id', sql.Int, id)
    .input('rs', sql.VarChar(200), razonSocial)
    .input('nc', sql.VarChar(200), nombreComercial)
    .input('dir', sql.VarChar(200), direccion)
    .input('ub', sql.Char(6), ubigeo)
    .input('dis', sql.VarChar(50), distrito)
    .input('prov', sql.VarChar(50), provincia)
    .input('dep', sql.VarChar(50), Departamento)
    .input('tel', sql.VarChar(15), telefono)
    .input('cel', sql.VarChar(15), celular)
    .input('mail', sql.VarChar(100), correo)
    .input('tp', sql.VarChar(50), tipoProveedor)
    .input('cont', sql.VarChar(100), contacto)
    .query(`UPDATE Proveedores
            SET RazonSocial = @rs, NombreComercial = @nc, Direccion = @dir,
                Ubigeo = @ub, Distrito = @dis, Provincia = @prov,
                Departamento = @dep, Telefono = @tel, Celular = @cel,
                Correo = @mail, TipoProveedor= @tp, Contacto = @cont
            WHERE idProveedor= @id`);
  res.json({ message: 'Proveedor actualizado' });
};

/* ---------- SOFT DELETE ---------- */
export const desactivarProveedor = async (req, res, next) => {
  const id = Number(req.params.id);
  await pool.request()
    .input('id', sql.Int, id)
    .query('UPDATE Proveedores SET Activo = 0 WHERE idProveedor = @id');
  res.json({ message: 'Proveedor desactivado' });
};

export const activarProveedor = async (req, res, next) => {
  const id = Number(req.params.id);
  await pool.request()
    .input('id', sql.Int, id)
    .query('UPDATE Proveedores SET Activo = 1 WHERE idProveedor = @id');
  res.json({ message: 'Proveedor activado' });
};