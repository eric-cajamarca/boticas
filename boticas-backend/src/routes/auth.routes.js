import { Router } from 'express';
import { body } from 'express-validator';
import { registro, loginSuper, logoutSuper } from '../controllers/auth.controller.js';
import { validar } from '../utils/validar.js';

const router = Router();

router.post(
  '/registro',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    validar
  ],
  registro
);

// router.post(
//   '/login',
//   [
//     body('email').isEmail(),
//     body('password').notEmpty(),
//     validar
//   ],
//   login
// );

router.post('/login/super', body('email').isEmail(), body('password').notEmpty(), validar, loginSuper);
router.post('/logout', logoutSuper);


  
export default router;