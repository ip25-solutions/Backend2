import passport from 'passport';
import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';

export const autenticarConPassport = (estrategia, mensajePredeterminado, estadoPredeterminado) =>
  (request, response, next) => {
    passport.authenticate(estrategia, { session: false }, (error, user, info) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        const mensaje = info?.status ? info.message : mensajePredeterminado;
        const estado = info?.status ?? estadoPredeterminado;
        return next(new ErrorAplicacion(mensaje, estado));
      }

      request.user = user;
      return next();
    })(request, response, next);
  };
