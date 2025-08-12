import { Router } from 'express';
import { body } from 'express-validator';
import {
  listarCajas, crearCaja, abrirCaja, cerrarCaja, registrarMovimiento, flujoCaja
} from '../controllers/caja.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

// Cajas maestras (opcional CRUD)
router.get('/cajas', autenticar, listarCajas);
router.post('/cajas', autenticar, [body('codigo').isLength({ min: 1, max: 10 }), body('descripcion').notEmpty(), validar], crearCaja);

// Flujo diario
router.post('/apertura', autenticar, [body('idEmpresa').isInt(), body('idCaja').isInt(), body('saldoInicial').isFloat({ min: 0 }), validar], abrirCaja);
router.patch('/:id/cierre', autenticar, cerrarCaja);
router.post('/movimiento', autenticar, [body('idApertura').isInt(), body('tipo').isIn(['I', 'E']), body('monto').isFloat({ min: 0 }), validar], registrarMovimiento);
router.get('/flujo', autenticar, [body('idApertura').isInt()], flujoCaja);

export default router;