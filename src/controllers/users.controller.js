const convertirUsuarioPublico = (usuario) => ({
  id: usuario._id?.toString() ?? usuario.id,
  first_name: usuario.first_name,
  last_name: usuario.last_name,
  email: usuario.email,
  role: usuario.role
});

export class UsersController {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
    this.listar = this.listar.bind(this);
  }

  async listar(request, response, next) {
    try {
      const usuarios = await this.usersRepository.findAll();
      response.status(200).json({
        status: 'success',
        payload: usuarios.map(convertirUsuarioPublico)
      });
    } catch (error) {
      next(error);
    }
  }
}
