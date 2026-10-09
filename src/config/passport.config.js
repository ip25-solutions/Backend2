import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { COOKIE_AUTENTICACION } from './cookie.js';
import { entorno } from './entorno.js';
import { sessionsService } from './dependencias.js';

const extractJwtFromCookie = (request) => request?.cookies?.[COOKIE_AUTENTICACION] ?? null;

const registerStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    badRequestMessage: 'Faltan campos obligatorios'
  },
  async (request, _email, _password, done) => {
    try {
      return done(null, await sessionsService.register(request.body));
    } catch (error) {
      return done(error);
    }
  }
);

const loginStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    badRequestMessage: 'Credenciales inválidas'
  },
  async (request, _email, _password, done) => {
    try {
      return done(null, await sessionsService.login(request.body));
    } catch (error) {
      return done(error);
    }
  }
);

const currentStrategy = new JwtStrategy(
  {
    jwtFromRequest: extractJwtFromCookie,
    secretOrKey: entorno.jwtSecret
  },
  (payload, done) => {
    const { id, email, role } = payload;

    if (!id || !email || !role) {
      return done(null, false, { message: 'No autenticado', status: 401 });
    }

    return done(null, { id, email, role });
  }
);

export const configurarPassport = () => {
  passport.use('register', registerStrategy);
  passport.use('login', loginStrategy);
  passport.use('current', currentStrategy);
};
