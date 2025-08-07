import { Router } from 'express';
import { body } from 'express-validator';
import { 
    crearEmpleadoUsuario,
    editarEmpleadoUsuario,
  toggleEmpleado,
  eliminarEmpleado } from '../controllers/empleado.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.post(
  '/',
   autenticar,
  [
    body('tipoDocumento').isLength({ min: 2, max: 2 }),
    body('numeroDocumento').isLength({ min: 1, max: 12 }),
    body('nombres').notEmpty(),
    body('apellidos').notEmpty(),
    body('correo').isEmail(),
    body('idPuesto').isInt(),
    body('usuario').isLength({ min: 3, max: 20 }),
    body('contrasena').isLength({ min: 6 }),
    body('permisos').optional().isArray(),
    validar
  ],
  crearEmpleadoUsuario
);

router.put(
  '/:id',
  autenticar,
  [
    body('nombres').optional().notEmpty(),
    body('apellidos').optional().notEmpty(),
    body('correo').optional().isEmail(),
    body('idPuesto').optional().isInt(),
    validar
  ],
  editarEmpleadoUsuario
);

router.patch(
  '/:id/disable',
  autenticar,
  [body('activo').isBoolean(), validar],
  toggleEmpleado
);

router.patch(
  '/:id/enable',
  autenticar,
  [body('activo').isBoolean(), validar],
  toggleEmpleado
);

router.delete(
  '/:id',
  autenticar,
  eliminarEmpleado
);



export default router;