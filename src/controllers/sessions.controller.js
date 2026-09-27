import {
  COOKIE_AUTENTICACION,
  opcionesBaseCookieAutenticacion,
  opcionesCookieAutenticacion
} from '../config/cookie.js';

export class SessionsController {
  constructor(sessionsService) {
    this.sessionsService = sessionsService;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.current = this.current.bind(this);
    this.logout = this.logout.bind(this);
  }

  async register(request, response, next) {
    try {
      const user = await this.sessionsService.register(request.body);
      response.status(201).json({ status: 'success', payload: user });
    } catch (error) {
      next(error);
    }
  }

  async login(request, response, next) {
    try {
      const token = await this.sessionsService.login(request.body);
      response.cookie(COOKIE_AUTENTICACION, token, opcionesCookieAutenticacion);
      response.status(200).json({ status: 'success', message: 'Login correcto' });
    } catch (error) {
      next(error);
    }
  }

  current(request, response) {
    const { id, email, role } = request.user;
    response.status(200).json({ status: 'success', payload: { id, email, role } });
  }

  logout(request, response) {
    response.clearCookie(COOKIE_AUTENTICACION, opcionesBaseCookieAutenticacion);
    response.status(200).json({ status: 'success', message: 'Sesión cerrada' });
  }
}
