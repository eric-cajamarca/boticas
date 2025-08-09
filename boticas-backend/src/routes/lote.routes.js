import { Router } from 'express';
import { body } from 'express-validator';
import * as L from '../controllers/lote.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, L.listarLotes);

router.post('/', autenticar, [
  body('idProducto').isInt(),
  body('numeroLote').isLength({ min: 1, max: 50 }),
  body('cantidad').isInt({ min: 1 }),
  body('fechaVencimiento').isISO8601(),
  body('idUbicacion').isInt(),
  validar
], L.crearLote);

router.put('/:id', autenticar, [
  body('estado').optional().isIn(['Disponible', 'Cuarentena', 'Descartado']),
  validar
], L.editarLote);

router.delete('/:id', autenticar, L.eliminarLote);

export default router;