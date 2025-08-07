import sql from 'mssql';
import { pool } from '../config/db.js';

/* ---------- CREAR ---------- */
export async function crearEmpresa(req, res, next) {
  const {
    ruc, razonSocial, rubro, direccion, distrito, region, provincia,
    celular, correo, alias
  } = req.body;

  try {
    const result = await pool.request()
      .input('ruc', sql.VarChar(11), ruc)
      .input('razonSocial', sql.VarChar(200), razonSocial)
      .input('rubro', sql.VarChar(100), rubro)
      .input('direccion', sql.VarChar(200), direccion)
      .input('distrito', sql.VarChar(50), distrito)
      .input('region', sql.VarChar(50), region)
      .input('provincia', sql.VarChar(50), provincia)
      .input('celular', sql.VarChar(11), celular)
      .input('correo', sql.VarChar(100), correo)
      .input('alias', sql.VarChar(29), alias)
      .query(`INSERT INTO Empresa 
              (Ruc, Razon_Social, Rubro, Direccion, Distrito, Region, Provincia, Celular, Correo, Alias)
              OUTPUT INSERTED.idEmpresa
              VALUES (@ruc, @razonSocial, @rubro, @direccion, @distrito, @region, @provincia, @celular, @correo, @alias)`);
    res.status(201).json({ message: 'Empresa creada', idEmpresa: result.recordset[0].idEmpresa });
  } catch (err) {
    if (err.number === 2627) { err.status = 409; err.message = 'RUC ya existe'; }
    next(err);
  }
}

/* ---------- EDITAR ---------- */
export async function editarEmpresa(req, res, next) {
  const id = Number(req.params.id);
  const {
    razonSocial, rubro, direccion, distrito, region, provincia, celular, correo, alias
  } = req.body;

  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('rs', sql.VarChar(200), razonSocial)
      .input('ru', sql.VarChar(100), rubro)
      .input('di', sql.VarChar(200), direccion)
      .input('di2', sql.VarChar(50), distrito)
      .input('re', sql.VarChar(50), region)
      .input('pr', sql.VarChar(50), provincia)
      .input('cel', sql.VarChar(11), celular)
      .input('co', sql.VarChar(100), correo)
      .input('al', sql.VarChar(29), alias)
      .query(`UPDATE Empresa
              SET Razon_Social = @rs,
                  Rubro        = @ru,
                  Direccion    = @di,
                  Distrito     = @di2,
                  Region       = @re,
                  Provincia    = @pr,
                  Celular      = @cel,
                  Correo       = @co,
                  Alias        = @al
              WHERE idEmpresa = @id`);
    res.json({ message: 'Empresa actualizada' });
  } catch (err) {
    next(err);
  }
}

/* ---------- HABILITAR / DESHABILITAR ---------- */
export async function toggleEmpresa(req, res, next) {
  const id = Number(req.params.id);
  const activo = Boolean(req.body.activo); // true o false

  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('a', sql.Bit, activo)
      .query(`UPDATE Empresa SET Activo = @a WHERE idEmpresa = @id`);
    res.json({ message: activo ? 'Empresa habilitada' : 'Empresa deshabilitada', id });
  } catch (err) {
    next(err);
  }
}

/* ---------- SOFT DELETE ---------- */
export async function eliminarEmpresa(req, res, next) {
  const id = Number(req.params.id);

  try {
    await pool.request()
      .input('id', sql.Int, id)
      .query(`UPDATE Empresa SET Activo = 0 WHERE idEmpresa = @id`);
    res.json({ message: 'Empresa desactivada (soft delete)', id });
  } catch (err) {
    next(err);
  }
}




// import sql from 'mssql';
// import { pool } from '../config/db.js';

// export async function crearEmpresa(req, res, next) {
//   const {
//     ruc, razonSocial, rubro, direccion, distrito, region, provincia,
//     celular, correo, alias
//   } = req.body;

//   console.log('Crear empresa:', req.body);

//   try {
//     const result = await pool.request()
//       .input('ruc', sql.VarChar(11), ruc)
//       .input('razonSocial', sql.VarChar(200), razonSocial)
//       .input('rubro', sql.VarChar(100), rubro)
//       .input('direccion', sql.VarChar(200), direccion)
//       .input('distrito', sql.VarChar(50), distrito)
//       .input('region', sql.VarChar(50), region)
//       .input('provincia', sql.VarChar(50), provincia)
//       .input('celular', sql.VarChar(11), celular)
//       .input('correo', sql.VarChar(100), correo)
//       .input('alias', sql.VarChar(29), alias)
//       .query(`INSERT INTO Empresa 
//               (Ruc, Razon_Social, Rubro, Direccion, Distrito, Region, Provincia, Celular, Correo, Alias)
//               OUTPUT INSERTED.idEmpresa
//               VALUES (@ruc, @razonSocial, @rubro, @direccion, @distrito, @region, @provincia, @celular, @correo, @alias)`);

//     res.status(201).json({ message: 'Empresa creada', idEmpresa: result.recordset[0].idEmpresa });
//   } catch (err) {
//     if (err.number === 2627) {  // RUC duplicado
//       err.status = 409;
//       err.message = 'RUC ya existe';
//     }
//     next(err);
//   }
// }