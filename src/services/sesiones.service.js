import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';
import { comparePassword, hashPassword } from '../utils/hash.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const esTextoNoVacio = (valor) => typeof valor === 'string' && valor.trim().length > 0;

export class ServicioSesiones {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async registrar(datos = {}) {
    const { first_name, last_name, email, password } = datos;

    if (
      !esTextoNoVacio(first_name) ||
      !esTextoNoVacio(last_name) ||
      !esTextoNoVacio(email) ||
      !esTextoNoVacio(password)
    ) {
      throw new ErrorAplicacion('Faltan campos obligatorios', 400);
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(emailNormalizado)) {
      throw new ErrorAplicacion('El formato del email no es válido', 400);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new ErrorAplicacion(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        400
      );
    }

    if (await this.usersRepository.findByEmail(emailNormalizado)) {
      throw new ErrorAplicacion('El email ya está registrado', 409);
    }

    return this.usersRepository.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: emailNormalizado,
      password: await hashPassword(password)
    });
  }

  async autenticar(datos = {}) {
    const { email, password } = datos;

    if (!esTextoNoVacio(email) || !esTextoNoVacio(password)) {
      throw new ErrorAplicacion('Credenciales inválidas', 401);
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(emailNormalizado)) {
      throw new ErrorAplicacion('Credenciales inválidas', 401);
    }

    const usuario = await this.usersRepository.findByEmailWithPassword(emailNormalizado);

    if (!usuario || !(await comparePassword(password, usuario.password))) {
      throw new ErrorAplicacion('Credenciales inválidas', 401);
    }

    return usuario;
  }
}
