import { validationResult } from 'express-validator';

export function validar(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Datos inválidos');
    err.status = 400;
    err.details = errors.array();
    return next(err);
  }
  next();
}