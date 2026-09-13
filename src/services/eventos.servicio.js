export class ServicioEventos {
  constructor(repositorioEventos) {
    this.repositorioEventos = repositorioEventos;
  }

  async listar() {
    return this.repositorioEventos.obtenerTodos();
  }
}
