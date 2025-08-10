import { Router } from 'express';
import { autenticar } from '../middlewares/auth.js';
import { stockActual }       from '../controllers/reportes/stockActual.js';
import { ventasRango }       from '../controllers/reportes/ventasrango.js';
import { vencimientoLotes }  from '../controllers/reportes/vencimientoLotes.js';
import { cuentasCobrar }     from '../controllers/reportes/cuentasCobrar.js';
import { cuentasPagar }      from '../controllers/reportes/cuentasPagar.js';

const router = Router();

router.get('/stock',           autenticar, stockActual);
router.get('/ventas',          autenticar, ventasRango);
router.get('/lotes/vencimiento', autenticar, vencimientoLotes);
router.get('/cuentas/cobrar',  autenticar, cuentasCobrar);
router.get('/cuentas/pagar',   autenticar, cuentasPagar);

export default router;