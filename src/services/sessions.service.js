import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';
import { hashPassword } from '../utils/hash.js';

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

export class SessionsService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async register(data = {}) {
    const { first_name, last_name, email, password } = data ?? {};

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

    const existingUser = await this.usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ErrorAplicacion('El email ya está registrado', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await this.usersRepository.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: passwordHash
    });

    return toPublicUser(user);
  }
}
