import { verificarToken } from '../utils/jwt.js';

export function autenticar(req, res, next) {
    console.log('>>> Cookies recibidas:', req.cookies);  // <-- nuevo log
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No autorizado: sin token' });
  }

  try {
    const payload = verificarToken(token);
    req.usuario = payload;  // { id, email, rol }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}