import ms from 'ms';
import { entorno } from './entorno.js';

export const COOKIE_AUTENTICACION = 'currentUser';

export const opcionesBaseCookieAutenticacion = {
  httpOnly: true,
  sameSite: 'lax',
  secure: entorno.ambiente === 'production'
};

export const opcionesCookieAutenticacion = {
  ...opcionesBaseCookieAutenticacion,
  maxAge: ms(entorno.jwtExpiresIn)
};
