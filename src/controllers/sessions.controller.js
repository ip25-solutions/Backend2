import {
  COOKIE_AUTENTICACION,
  opcionesCookieAutenticacion
} from '../config/cookie.js';

export class SessionsController {
  constructor(sessionsService) {
    this.sessionsService = sessionsService;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
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
}
