import { entorno } from './entorno.js';

export const COOKIE_AUTENTICACION = 'currentUser';

export const opcionesCookieAutenticacion = {
  httpOnly: true,
  sameSite: 'lax',
  secure: entorno.ambiente === 'production',
  maxAge: 3600000
};
