
import { generarToken } from '../utils/jwt.js';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import jwt from 'jsonwebtoken';
import { hashPassword } from '../utils/hash.js';
import { comparePassword } from '../utils/hash.js';

export async function registro(req, res, next) {
  try {
    const { email, password } = req.body;
    const hashed = await hashPassword(password);
    // const hashed = await bcrypt.hash(password, 10);

    await pool.request()
      .input('email', email)
      .input('hash', hashed)
      .query('INSERT INTO superUser (email, password_hash) VALUES (@email, @hash)');

    res.status(201).json({ message: 'Super usuario creado' });
  } catch (err) {
    if (err.number === 2627) {  // violación de PK
      err.status = 409;
      err.message = 'El usuario ya existe';
    }
    next(err);
  }
}

export async function loginSuper(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await pool.request()
      .input('email', email)
      .query('SELECT id, password_hash FROM superUser WHERE email = @email');

    const user = result.recordset[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    // if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    //   return res.status(401).json({ message: 'Credenciales inválidas' });
    // }

    const token = jwt.sign(
      { id: user.id, email, rol: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).json({ message: 'Bien venido ...' });
  } catch (err) {
    next(err);
  }
}

//quiero crear un metodo para cerrar sesión del super usuario
export async function logoutSuper(req, res) {
  console.log('Cerrando sesión del super usuario');
  res.clearCookie('token').json({ message: 'Sesión cerrada' });
}
// src/controllers/auth.controller.js


// export async function crearCuenta(req, res, next) {
//   const {
//     tipoDocumento, numeroDocumento, nombres, apellidos, correo, idPuesto,
//     usuario, contrasena, permisos
//   } = req.body;

//   const transaction = new sql.Transaction(pool);
//   try {
//     await transaction.begin();

//     // 1. Insertar Empleado
//     const empResult = await transaction.request()
//       .input('tipoDoc', sql.Char(2), tipoDocumento)
//       .input('numDoc', sql.VarChar(12), numeroDocumento)
//       .input('nombres', sql.VarChar(50), nombres)
//       .input('apellidos', sql.VarChar(100), apellidos)
//       .input('correo', sql.VarChar(100), correo)
//       .input('idPuesto', sql.Int, idPuesto)
//       .query(`INSERT INTO Empleados (TipoDocumento, NumeroDocumento, Nombres, Apellidos, Correo, idPuesto, FechaIngreso)
//               OUTPUT INSERTED.idEmpleado
//               VALUES (@tipoDoc, @numDoc, @nombres, @apellidos, @correo, @idPuesto, GETDATE())`);

//     const idEmpleado = empResult.recordset[0].idEmpleado;

//     // 2. Hash + Salt
//     const saltRounds = 10;
//     const salt = await bcrypt.genSalt(saltRounds);
//     const hash = await bcrypt.hash(contrasena, salt);

//     // 3. Insertar Usuario
//     const usrResult = await transaction.request()
//       .input('idEmp', sql.Int, idEmpleado)
//       .input('usr', sql.VarChar(20), usuario)
//       .input('hash', sql.VarChar(128), hash)
//       .input('salt', sql.VarChar(50), salt)
//       .query(`INSERT INTO Usuarios (idEmpleado, Usuario, ContrasenaHash, Salt)
//               OUTPUT INSERTED.idUsuario
//               VALUES (@idEmp, @usr, @hash, @salt)`);

//     const idUsuario = usrResult.recordset[0].idUsuario;

//     // 4. Insertar permisos
//     for (const idPermiso of permisos) {
//       await transaction.request()
//         .input('idUsr', sql.Int, idUsuario)
//         .input('idPer', sql.Int, idPermiso)
//         .query(`INSERT INTO UsuarioPermisos (idUsuario, idPermiso, AsignadoPor)
//                 VALUES (@idUsr, @idPer, @idUsr)`);
//     }

//     await transaction.commit();
//     res.status(201).json({ message: 'Cuenta creada', idUsuario });
//   } catch (err) {
//     await transaction.rollback();
//     next(err);
//   }


// }
