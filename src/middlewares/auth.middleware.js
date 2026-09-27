import { COOKIE_AUTENTICACION } from '../config/cookie.js';
import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';
import { verificarToken } from '../utils/jwt.js';

export const autenticar = (request, response, next) => {
  const token = request.cookies?.[COOKIE_AUTENTICACION];

  if (!token) {
    return next(new ErrorAplicacion('No autenticado', 401));
  }

  try {
    request.user = verificarToken(token);
    return next();
  } catch {
    return next(new ErrorAplicacion('No autenticado', 401));
  }
};
