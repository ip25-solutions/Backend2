import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';
import { comparePassword, hashPassword } from '../utils/hash.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export class SessionsService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(data = {}) {
    const { first_name, last_name, email, password } = data;

    if (
      !isNonEmptyString(first_name) ||
      !isNonEmptyString(last_name) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(password)
    ) {
      throw new ErrorAplicacion('Faltan campos obligatorios', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw new ErrorAplicacion('El formato del email no es válido', 400);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new ErrorAplicacion(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        400
      );
    }

    if (await this.userRepository.findByEmail(normalizedEmail)) {
      throw new ErrorAplicacion('El email ya está registrado', 409);
    }

    return this.userRepository.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: await hashPassword(password)
    });
  }

  async login(data = {}) {
    const { email, password } = data;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new ErrorAplicacion('Credenciales inválidas', 401);
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw new ErrorAplicacion('Credenciales inválidas', 401);
    }

    const user = await this.userRepository.findByEmailWithPassword(normalizedEmail);

    if (!user || !(await comparePassword(password, user.password))) {
      throw new ErrorAplicacion('Credenciales inválidas', 401);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
  }
}
