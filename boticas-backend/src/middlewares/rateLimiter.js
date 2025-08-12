import rateLimit from 'express-rate-limit';

/* Límite general */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,                 // 200 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas peticiones, intente más tarde' }
});

/* Límite estricto para login */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                   // 5 intentos de login
  skipSuccessfulRequests: true
});