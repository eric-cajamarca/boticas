import sql from 'mssql';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

/* ---------- CREAR ---------- */
export async function crearEmpleadoUsuario(req, res, next) {
  const {
    tipoDocumento, numeroDocumento, nombres, apellidos, correo, idPuesto,
    usuario, contrasena, permisos = []
  } = req.body;

  const tx = new sql.Transaction(pool);
  try {
    await tx.begin();

    // Empleado
    const emp = await tx.request()
      .input('td', sql.Char(2), tipoDocumento)
      .input('nd', sql.VarChar(12), numeroDocumento)
      .input('n', sql.VarChar(50), nombres)
      .input('a', sql.VarChar(100), apellidos)
      .input('c', sql.VarChar(100), correo)
      .input('ip', sql.Int, idPuesto)
      .query(`INSERT INTO Empleados (TipoDocumento, NumeroDocumento, Nombres, Apellidos, Correo, idPuesto, FechaIngreso)
              OUTPUT INSERTED.idEmpleado
              VALUES (@td, @nd, @n, @a, @c, @ip, GETDATE())`);
    const idEmp = emp.recordset[0].idEmpleado;

    // Usuario
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);
    const usr = await tx.request()
      .input('ie', sql.Int, idEmp)
      .input('u', sql.VarChar(20), usuario)
      .input('h', sql.VarChar(128), hash)
      .input('s', sql.VarChar(50), salt)
      .query(`INSERT INTO Usuarios (idEmpleado, Usuario, ContrasenaHash, Salt)
              OUTPUT INSERTED.idUsuario
              VALUES (@ie, @u, @h, @s)`);
    const idUsr = usr.recordset[0].idUsuario;

    // Permisos
    for (const idPer of permisos) {
      await tx.request()
        .input('iu', sql.Int, idUsr)
        .input('ip', sql.Int, idPer)
        .query(`INSERT INTO UsuarioPermisos (idUsuario, idPermiso, AsignadoPor) VALUES (@iu, @ip, @iu)`);
    }

    await tx.commit();
    res.status(201).json({ message: 'Empleado y usuario creados', idUsuario: idUsr });
  } catch (err) {
    await tx.rollback();
    if (err.number === 2627) {
      err.status = 409;
      err.message = 'Documento o usuario ya existe';
    }
    next(err);
  }
}

/* ---------- EDITAR ---------- */
export async function editarEmpleadoUsuario(req, res, next) {
  const id = Number(req.params.id);
  const { nombres, apellidos, correo, idPuesto } = req.body;

  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('n', sql.VarChar(50), nombres)
      .input('a', sql.VarChar(100), apellidos)
      .input('c', sql.VarChar(100), correo)
      .input('ip', sql.Int, idPuesto)
      .query(`UPDATE Empleados
              SET Nombres = @n, Apellidos = @a, Correo = @c, idPuesto = @ip
              WHERE idEmpleado = @id`);

    res.json({ message: 'Empleado actualizado' });
  } catch (err) {
    next(err);
  }
}

/* ---------- DESHABILITAR / HABILITAR ---------- */
export async function toggleEmpleado(req, res, next) {
  const id = Number(req.params.id);
  const activo = req.body.activo; // true o false

  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('a', sql.Bit, activo)
      .query(`UPDATE Empleados SET Activo = @a WHERE idEmpleado = @id`);
    res.json({ message: activo ? 'Empleado habilitado' : 'Empleado deshabilitado' });
  } catch (err) {
    next(err);
  }
}

/* ---------- SOFT DELETE ---------- */
export async function eliminarEmpleado(req, res, next) {
  const id = Number(req.params.id);

  try {
    // 1. Desactivar empleado
    await pool.request()
      .input('id', sql.Int, id)
      .query(`UPDATE Empleados SET Activo = 0 WHERE idEmpleado = @id`);

    // 2. Bloquear usuario
    await pool.request()
      .input('id', sql.Int, id)
      .query(`UPDATE Usuarios SET Bloqueado = 1
              WHERE idEmpleado = @id`);

    res.json({ message: 'Empleado y usuario marcados como eliminados' });
  } catch (err) {
    next(err);
  }
}




// import sql from 'mssql';
// import bcrypt from 'bcrypt';
// import { pool } from '../config/db.js';

// export async function crearEmpleadoUsuario(req, res, next) {
//   const {
//     tipoDocumento, numeroDocumento, nombres, apellidos, correo, idPuesto,
//     usuario, contrasena, permisos = []
//   } = req.body;

//   const transaction = new sql.Transaction(pool);
//   try {
//     await transaction.begin();

//     // 1. Empleado
//     const emp = await transaction.request()
//       .input('tipoDoc', sql.Char(2), tipoDocumento)
//       .input('numDoc', sql.VarChar(12), numeroDocumento)
//       .input('nombres', sql.VarChar(50), nombres)
//       .input('apellidos', sql.VarChar(100), apellidos)
//       .input('correo', sql.VarChar(100), correo)
//       .input('idPuesto', sql.Int, idPuesto)
//       .query(`INSERT INTO Empleados 
//               (TipoDocumento, NumeroDocumento, Nombres, Apellidos, Correo, idPuesto, FechaIngreso)
//               OUTPUT INSERTED.idEmpleado
//               VALUES (@tipoDoc, @numDoc, @nombres, @apellidos, @correo, @idPuesto, GETDATE())`);

//     const idEmpleado = emp.recordset[0].idEmpleado;

//     // 2. Usuario
//     const saltRounds = 10;
//     const salt = await bcrypt.genSalt(saltRounds);
//     const hash = await bcrypt.hash(contrasena, salt);

//     const usr = await transaction.request()
//       .input('idEmp', sql.Int, idEmpleado)
//       .input('usr', sql.VarChar(20), usuario)
//       .input('hash', sql.VarChar(128), hash)
//       .input('salt', sql.VarChar(50), salt)
//       .query(`INSERT INTO Usuarios 
//               (idEmpleado, Usuario, ContrasenaHash, Salt)
//               OUTPUT INSERTED.idUsuario
//               VALUES (@idEmp, @usr, @hash, @salt)`);

//     const idUsuario = usr.recordset[0].idUsuario;

//     // 3. Permisos
//     for (const idPermiso of permisos) {
//       await transaction.request()
//         .input('idUsr', sql.Int, idUsuario)
//         .input('idPer', sql.Int, idPermiso)
//         .query(`INSERT INTO UsuarioPermisos (idUsuario, idPermiso, AsignadoPor)
//                 VALUES (@idUsr, @idPer, @idUsr)`);
//     }

//     await transaction.commit();
//     res.status(201).json({ message: 'Empleado y usuario creados', idUsuario });
//   } catch (err) {
//     await transaction.rollback();
//     if (err.number === 2627) {
//       err.status = 409;
//       err.message = 'Documento o usuario ya existe';
//     }
//     next(err);
//   }
// }

