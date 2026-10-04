import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';
import { ESTADOS_EVENTO } from '../config/eventos.js';
import { ROLES } from '../config/permisos.js';

const camposDeTextoObligatorios = ['title', 'description', 'category', 'location'];
const estadosValidos = new Set(Object.values(ESTADOS_EVENTO));

const validarCreacion = (datosEvento) => {
  const faltanCamposDeTexto = camposDeTextoObligatorios.some(
    (campo) => typeof datosEvento[campo] !== 'string' || !datosEvento[campo].trim()
  );

  if (faltanCamposDeTexto || datosEvento.date === undefined) {
    throw new ErrorAplicacion('Faltan campos obligatorios del evento', 400);
  }

  const date = new Date(datosEvento.date);

  if (Number.isNaN(date.getTime())) {
    throw new ErrorAplicacion('La fecha del evento no es válida', 400);
  }

  if (date <= new Date()) {
    throw new ErrorAplicacion('La fecha del evento debe ser futura', 400);
  }

  if (!Number.isFinite(datosEvento.capacity) || datosEvento.capacity <= 0) {
    throw new ErrorAplicacion('La capacidad debe ser mayor que cero', 400);
  }

  if (!Number.isFinite(datosEvento.price) || datosEvento.price < 0) {
    throw new ErrorAplicacion('El precio no puede ser negativo', 400);
  }

  if (datosEvento.status !== undefined && !estadosValidos.has(datosEvento.status)) {
    throw new ErrorAplicacion('El estado del evento no es válido', 400);
  }
};

const validarPropiedad = (evento, usuario) => {
  if (usuario.role === ROLES.ADMINISTRADOR) {
    return;
  }

  if (evento.organizer?.toString() !== usuario.id) {
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

  async crear(datosEvento, organizerId) {
    validarCreacion(datosEvento);
    const { organizer: _organizerIgnorado, ...datosPermitidos } = datosEvento;

    return this.repositorioEventos.crear({
      ...datosPermitidos,
      status: datosPermitidos.status ?? ESTADOS_EVENTO.BORRADOR,
      organizer: organizerId
    });
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
