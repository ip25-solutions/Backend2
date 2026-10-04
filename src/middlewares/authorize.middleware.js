import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';

export const autorizar = (...rolesPermitidos) => (request, response, next) => {
  if (!request.user) {
    return next(new ErrorAplicacion('No autenticado', 401));
  }

  if (!rolesPermitidos.includes(request.user.role)) {
    return next(new ErrorAplicacion('No tenés permisos para realizar esta acción', 403));
  }

  return next();
};
