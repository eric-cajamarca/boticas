import { Router } from 'express';
import { body } from 'express-validator';
import * as P from '../controllers/proveedor.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, P.listarProveedores);
router.post('/', autenticar, [
  body('tipoDocumento').isLength({ min: 2, max: 2 }),
  body('numeroDocumento').isLength({ min: 1, max: 12 }),
  body('razonSocial').notEmpty(),
  validar
], P.crearProveedor);
router.put('/:id', autenticar, P.editarProveedor);
router.patch('/:id/disable', autenticar, P.desactivarProveedor);
router.patch('/:id/enable', autenticar, P.activarProveedor);

export default router;