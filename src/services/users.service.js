export class UsersService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async listar() {
    return this.userRepository.findAll();
  }
}
