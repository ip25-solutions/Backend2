import { obtenerId } from './dto.utils.js';

export const crearUsuarioDto = (usuario) => ({
  id: obtenerId(usuario),
  first_name: usuario.first_name,
  last_name: usuario.last_name,
  email: usuario.email,
  role: usuario.role
});
