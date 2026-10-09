import {
  COOKIE_AUTENTICACION,
  opcionesBaseCookieAutenticacion,
  opcionesCookieAutenticacion
} from '../config/cookie.js';
import { generarToken } from '../utils/jwt.js';
import { AuthenticatedUserDTO } from '../dto/authenticated-user.dto.js';
import { UserDTO } from '../dto/user.dto.js';

export class SessionsController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.current = this.current.bind(this);
    this.logout = this.logout.bind(this);
  }

  register(request, response) {
    response.status(201).json({ status: 'success', payload: UserDTO.from(request.user) });
  }

  login(request, response, next) {
    try {
      const token = generarToken(request.user);
      response.cookie(COOKIE_AUTENTICACION, token, opcionesCookieAutenticacion);
      response.status(200).json({ status: 'success', message: 'Login correcto' });
    } catch (error) {
      next(error);
    }
  }

  current(request, response) {
    response.status(200).json({
      status: 'success',
      payload: AuthenticatedUserDTO.from(request.user)
    });
  }

  logout(request, response) {
    response.clearCookie(COOKIE_AUTENTICACION, opcionesBaseCookieAutenticacion);
    response.status(200).json({ status: 'success', message: 'Sesión cerrada' });
  }
}
