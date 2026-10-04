import { COOKIE_AUTENTICACION } from '../config/cookie.js';
import { ROLES } from '../config/permisos.js';
import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';
import { verificarToken } from '../utils/jwt.js';

const rolesValidos = new Set(Object.values(ROLES));

export const autenticar = (request, response, next) => {
  const token = request.cookies?.[COOKIE_AUTENTICACION];

  if (!token) {
    return next(new ErrorAplicacion('No autenticado', 401));
  }

  try {
    const { id, email, role } = verificarToken(token);

    if (!id || !email || !rolesValidos.has(role)) {
      return next(new ErrorAplicacion('No autenticado', 401));
    }

    request.user = { id, email, role };
    return next();
  } catch {
    return next(new ErrorAplicacion('No autenticado', 401));
  }
};
