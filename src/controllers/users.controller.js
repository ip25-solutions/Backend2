import { crearUsuarioDto } from '../dto/user.dto.js';

export class UsersController {
  constructor(servicioUsuarios) {
    this.servicioUsuarios = servicioUsuarios;
    this.listar = this.listar.bind(this);
  }

  async listar(request, response, next) {
    try {
      const usuarios = await this.servicioUsuarios.listar();
      response.status(200).json({
        status: 'success',
        payload: usuarios.map(crearUsuarioDto)
      });
    } catch (error) {
      next(error);
    }
  }
}
