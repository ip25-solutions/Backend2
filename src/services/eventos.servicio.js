import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';
import { ROLES } from '../config/permisos.js';

const validarPropiedad = (evento, usuario) => {
  if (usuario.role === ROLES.ADMINISTRADOR) {
    return;
  }

  if (evento.organizador?.toString() !== usuario.id) {
    throw new ErrorAplicacion('No tenés permisos para realizar esta acción', 403);
  }
};

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

  async actualizar(id, datosEvento, usuario) {
    const eventoExistente = await this.obtenerPorId(id);
    validarPropiedad(eventoExistente, usuario);

    const evento = await this.repositorioEventos.actualizar(id, datosEvento);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    return evento;
  }

  async eliminar(id, usuario) {
    const eventoExistente = await this.obtenerPorId(id);
    validarPropiedad(eventoExistente, usuario);

    const evento = await this.repositorioEventos.eliminar(id);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    return evento;
  }
}
