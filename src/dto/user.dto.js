import { convertirId } from './dto.utils.js';

export class UserDTO {
  static from(usuario) {
    return {
      id: convertirId(usuario.id ?? usuario._id),
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      email: usuario.email,
      role: usuario.role
    };
  }
}
