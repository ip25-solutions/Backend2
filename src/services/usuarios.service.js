export class ServicioUsuarios {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async listar() {
    return this.usersRepository.findAll();
  }
}
