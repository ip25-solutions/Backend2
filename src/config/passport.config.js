import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { COOKIE_AUTENTICACION } from './cookie.js';
import { entorno } from './entorno.js';
import { crearUsuarioDto } from '../dto/user.dto.js';

const extractJwtFromCookie = (request) => request?.cookies?.[COOKIE_AUTENTICACION] ?? null;

const crearEstrategiaRegistro = (servicioSesiones) => new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    badRequestMessage: 'Faltan campos obligatorios'
  },
  async (request, _email, _password, done) => {
    try {
      const user = await servicioSesiones.registrar(request.body);
      return done(null, crearUsuarioDto(user));
    } catch (error) {
      if (error.estado) {
        return done(null, false, { message: error.message, status: error.estado });
      }
      return done(error);
    }
  }
);

const crearEstrategiaLogin = (servicioSesiones) => new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    badRequestMessage: 'Credenciales inválidas'
  },
  async (request, _email, _password, done) => {
    try {
      const user = await servicioSesiones.autenticar(request.body);

      return done(null, {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });
    } catch (error) {
      if (error.estado) {
        return done(null, false, { message: error.message, status: error.estado });
      }
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

export const configurarPassport = (servicioSesiones) => {
  passport.use('register', crearEstrategiaRegistro(servicioSesiones));
  passport.use('login', crearEstrategiaLogin(servicioSesiones));
  passport.use('current', currentStrategy);
};
