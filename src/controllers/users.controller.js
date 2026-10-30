const convertirUsuarioPublico = (usuario) => ({
  id: usuario._id?.toString() ?? usuario.id,
  first_name: usuario.first_name,
  last_name: usuario.last_name,
  email: usuario.email,
  role: usuario.role
});

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
        payload: usuarios.map(convertirUsuarioPublico)
      });
    } catch (error) {
      next(error);
    }
  }
}
