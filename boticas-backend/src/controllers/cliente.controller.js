import sql from 'mssql';
import { pool } from '../config/db.js';

/* ---------- LISTAR ---------- */
export const listarClientes = async (_req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM Clientes WHERE Activo = 1 ORDER BY RazonSocial');
    res.json(r.recordset);
  } catch (e) { next(e); }
};

/* ---------- CREAR ---------- */
export const crearCliente = async (req, res, next) => {
  const {
    tipoDocumento, numeroDocumento, razonSocial, nombreComercial,
    direccion, ubigeo, distrito, provincia, departamento,
    telefono, celular, correo, tipoSeguro, NumAfiliacion
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
      .input('tp', sql.VarChar(50), tipoSeguro)
      .input('cont', sql.VarChar(100), NumAfiliacion)
      .query(`INSERT INTO Clientes
              (TipoDocumento, NumeroDocumento, RazonSocial, NombreComercial,
               Direccion, Ubigeo, Distrito, Provincia, Departamento,
               Telefono, Celular, Correo, TipoSeguro, NumeroAfiliacion,
               FechaRegistro, Activo)
              OUTPUT INSERTED.idCliente
              VALUES (@td, @nd, @rs, @nc, @dir, @ub, @dis, @prov, @dep,
                      @tel, @cel, @mail, @tp, @cont, GETDATE(), 1)`);
    res.status(201).json({ message: 'Cliente creado', idCliente: result.recordset[0].idCliente });
  } catch (err) {
    if (err.number === 2627) { err.status = 409; err.message = 'Documento duplicado'; }
    next(err);
  }
};

/* ---------- EDITAR ---------- */
export const editarCliente= async (req, res, next) => {
  const id = Number(req.params.id);
  const {
    razonSocial, nombreComercial, direccion, telefono, celular, correo,
    tipoSeguro, NumAfiliacion
  } = req.body;
  await pool.request()
    .input('id', sql.Int, id)
    .input('rs', sql.VarChar(200), razonSocial)
    .input('nc', sql.VarChar(200), nombreComercial)
    .input('dir', sql.VarChar(200), direccion)
    .input('tel', sql.VarChar(15), telefono)
    .input('cel', sql.VarChar(15), celular)
    .input('mail', sql.VarChar(100), correo)
    .input('tp', sql.VarChar(50), tipoSeguro)
    .input('cont', sql.VarChar(100), NumAfiliacion)
    .query(`UPDATE Clientes
            SET RazonSocial = @rs, NombreComercial = @nc, Direccion = @dir,
                Telefono = @tel, Celular = @cel, Correo = @mail,
                TipoCliente= @tp, Contacto = @cont
            WHERE idCliente= @id`);
  res.json({ message: 'Clienteactualizado' });
};

/* ---------- SOFT DELETE ---------- */
export const desactivarCliente= async (req, res, next) => {
  const id = Number(req.params.id);
  await pool.request()
    .input('id', sql.Int, id)
    .query('UPDATE Clientes SET Activo = 0 WHERE idCliente= @id');
  res.json({ message: 'Cliente desactivado' });
};

export const activarCliente= async (req, res, next) => {
  const id = Number(req.params.id);
  await pool.request()
    .input('id', sql.Int, id)
    .query('UPDATE Clientes SET Activo = 1 WHERE idCliente= @id');
  res.json({ message: 'Cliente activado' });
};