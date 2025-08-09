import { Router } from 'express';
import { body } from 'express-validator';
import * as Cli from '../controllers/cliente.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, Cli.listarClientes);
router.post('/', autenticar, [
  body('tipoDocumento').isLength({ min: 2, max: 2 }),
  body('numeroDocumento').isLength({ min: 1, max: 12 }),
  body('razonSocial').notEmpty(),
  validar
], Cli.crearCliente);
router.put('/:id', autenticar, Cli.editarCliente);
router.patch('/:id/disable', autenticar, Cli.desactivarCliente);
router.patch('/:id/enable', autenticar, Cli.activarCliente);

export default router;