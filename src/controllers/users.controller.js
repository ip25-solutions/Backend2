import { UserDTO } from '../dto/user.dto.js';

export class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
    this.listar = this.listar.bind(this);
  }

  async listar(request, response, next) {
    try {
      const usuarios = await this.usersService.listar();
      response.status(200).json({
        status: 'success',
        payload: usuarios.map(UserDTO.from)
      });
    } catch (error) {
      next(error);
    }
  }
}
