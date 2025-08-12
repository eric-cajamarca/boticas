import { Router } from 'express';
import { body } from 'express-validator';
import { crearEmpresa, editarEmpresa, eliminarEmpresa,toggleEmpresa } from '../controllers/empresa.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';
import { empresaSchema } from '../validators/esquemas.js';
import { validarJoi } from '../middlewares/validarJoi.js';

const router = Router();

router.post(
  '/',
   autenticar,                    // ← comentado
  [
    body('ruc').isLength({ min: 11, max: 11 }),
    body('razonSocial').notEmpty(),
    body('rubro').notEmpty(),
    validar
  ],
  crearEmpresa
);

//router.post('/', autenticar, validarJoi(empresaSchema), crearEmpresa);
router.put(
  '/:id',
  autenticar,
  [
    body('razonSocial').optional().notEmpty(),
    body('rubro').optional().notEmpty(),
    body('correo').optional().isEmail(),
    validar
  ],
  editarEmpresa
);

router.patch(
  '/:id/disable',
  autenticar,
  [body('activo').isBoolean(), validar],
  toggleEmpresa
);

router.patch(
  '/:id/enable',
  autenticar,
  [body('activo').isBoolean(), validar],
  toggleEmpresa
);

router.delete(
  '/:id',
  autenticar,
  eliminarEmpresa
);


export default router;