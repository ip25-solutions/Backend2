import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { COOKIE_AUTENTICACION } from './cookie.js';
import { entorno } from './entorno.js';
import { usersRepository } from './dependencias.js';
import { comparePassword, hashPassword } from '../utils/hash.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const toPublicUser = (user) => ({
  id: user._id.toString(),
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role
});

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
      const { first_name, last_name, email: bodyEmail, password: bodyPassword } = request.body ?? {};

      if (
        !isNonEmptyString(first_name) ||
        !isNonEmptyString(last_name) ||
        !isNonEmptyString(bodyEmail) ||
        !isNonEmptyString(bodyPassword)
      ) {
        return done(null, false, { message: 'Faltan campos obligatorios', status: 400 });
      }

      const normalizedEmail = bodyEmail.trim().toLowerCase();

      if (!EMAIL_PATTERN.test(normalizedEmail)) {
        return done(null, false, { message: 'El formato del email no es válido', status: 400 });
      }

      if (bodyPassword.length < MIN_PASSWORD_LENGTH) {
        return done(null, false, {
          message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
          status: 400
        });
      }

      const existingUser = await usersRepository.findByEmail(normalizedEmail);

      if (existingUser) {
        return done(null, false, { message: 'El email ya está registrado', status: 409 });
      }

      const passwordHash = await hashPassword(bodyPassword);
      const user = await usersRepository.create({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        password: passwordHash
      });

      return done(null, toPublicUser(user));
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
      const { email: bodyEmail, password: bodyPassword } = request.body ?? {};

      if (!isNonEmptyString(bodyEmail) || !isNonEmptyString(bodyPassword)) {
        return done(null, false, { message: 'Credenciales inválidas', status: 401 });
      }

      const normalizedEmail = bodyEmail.trim().toLowerCase();

      if (!EMAIL_PATTERN.test(normalizedEmail)) {
        return done(null, false, { message: 'Credenciales inválidas', status: 401 });
      }

      const user = await usersRepository.findByEmailWithPassword(normalizedEmail);

      if (!user || !(await comparePassword(bodyPassword, user.password))) {
        return done(null, false, { message: 'Credenciales inválidas', status: 401 });
      }

      return done(null, {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });
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
