import { Router } from 'express';
import { body } from 'express-validator';
import * as V from '../controllers/venta.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, V.listarVentas);
router.post('/', autenticar, [
  body('idEmpresa').isInt(),
  body('tipoComprobante').isLength({ min: 2, max: 2 }),
  body('fechaEmision').isISO8601(),
  body('idMoneda').isInt(),
  body('idCondicionPago').isInt(),
  body('subTotal').isFloat({ min: 0 }),
  body('igv').isFloat({ min: 0 }),
  body('total').isFloat({ min: 0 }),
  body('detalle').isArray({ min: 1 }),
  validar
], V.crearVenta);

router.patch('/:id/anular', autenticar, V.anularVenta);

export default router;