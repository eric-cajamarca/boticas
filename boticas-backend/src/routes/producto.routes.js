import { Router } from 'express';
import { body } from 'express-validator';
import * as P from '../controllers/producto.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/',      autenticar, P.listarProductos);
router.post('/',     autenticar, [
  body('idEmpresa').isInt(),
  body('codigo').isLength({ min: 1, max: 20 }),
  body('nombre').notEmpty(),
  body('idCategoria').isInt(),
  body('idPresentacion').isInt(),
  body('precioCompra').isFloat({ min: 0 }),
  body('precioVenta').isFloat({ min: 0 }),
  validar
], P.crearProducto);

router.put('/:id',   autenticar, [
  body('nombre').optional().notEmpty(),
  body('precioVenta').optional().isFloat({ min: 0 }),
  validar
], P.editarProducto);

router.delete('/:id', autenticar, P.eliminarProducto);

export default router;