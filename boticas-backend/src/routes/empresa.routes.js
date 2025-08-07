import { Router } from 'express';
import { body } from 'express-validator';
import { crearEmpresa } from '../controllers/empresa.controller.js';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';

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


export default router;