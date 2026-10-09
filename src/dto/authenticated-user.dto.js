import { convertirId } from './dto.utils.js';

export class AuthenticatedUserDTO {
  static from(usuario) {
    return {
      id: convertirId(usuario.id ?? usuario._id),
      email: usuario.email,
      role: usuario.role
    };
  }
}
