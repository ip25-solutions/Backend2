import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';

export class ServicioEventos {
  constructor(repositorioEventos) {
    this.repositorioEventos = repositorioEventos;
  }

  async listar() {
    return this.repositorioEventos.obtenerTodos();
  }

  async obtenerPorId(id) {
    const evento = await this.repositorioEventos.obtenerPorId(id);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    return evento;
  }

  async crear(datosEvento) {
    return this.repositorioEventos.crear(datosEvento);
  }

  async actualizar(id, datosEvento) {
    const evento = await this.repositorioEventos.actualizar(id, datosEvento);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    return evento;
  }

  async eliminar(id) {
    const evento = await this.repositorioEventos.eliminar(id);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    return evento;
  }
}
