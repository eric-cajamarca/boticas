import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Las cookies httpOnly se envían automáticamente
  return next(req);
};