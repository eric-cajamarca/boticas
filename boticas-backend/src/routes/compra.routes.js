import { Router } from 'express';
import { body } from 'express-validator';
import { listarCompras, crearCompra, anularCompra} from '../controllers/compra.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, listarCompras);
router.post('/', autenticar, [
  body('idEmpresa').isInt(),
  body('tipoDocumento').isLength({ min: 2, max: 2 }),
  body('serie').isLength({ min: 1, max: 4 }),
  body('numero').isLength({ min: 1, max: 8 }),
  body('fechaEmision').isISO8601(),
  body('idProveedor').isInt(),
  body('idMoneda').isInt(),
  body('subTotal').isFloat({ min: 0 }),
  body('igv').isFloat({ min: 0 }),
  body('total').isFloat({ min: 0 }),
  body('detalle').isArray({ min: 1 }),
  validar
], crearCompra);

router.patch('/:id/anular', autenticar, anularCompra);

export default router;