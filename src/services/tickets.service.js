import { randomUUID } from 'node:crypto';
import { ESTADOS_EVENTO } from '../config/eventos.js';
import { ESTADOS_TICKET } from '../config/tickets.js';
import { ROLES } from '../config/permisos.js';
import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';

export class ServicioTickets {
  constructor(repositorioTickets, repositorioEventos) {
    this.repositorioTickets = repositorioTickets;
    this.repositorioEventos = repositorioEventos;
  }

  async crear(eventId, usuario, quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ErrorAplicacion('La cantidad debe ser un número entero mayor que cero', 400);
    }

    const evento = await this.repositorioEventos.obtenerPorId(eventId);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    if (evento.status !== ESTADOS_EVENTO.PUBLICADO || new Date(evento.date) <= new Date()) {
      throw new ErrorAplicacion('El evento no está disponible para inscripciones', 409);
    }

    const ticketActivo = await this.repositorioTickets.obtenerActivoPorUsuarioYEvento(
      usuario.id,
      eventId
    );

    if (ticketActivo) {
      throw new ErrorAplicacion('Ya tenés una inscripción activa para este evento', 409);
    }

    const cantidadOcupada = await this.repositorioTickets.obtenerCantidadActiva(eventId);
    const cuposDisponibles = evento.capacity - cantidadOcupada;

    if (cuposDisponibles < quantity) {
      throw new ErrorAplicacion(
        `No hay cupos suficientes. Disponibles: ${Math.max(cuposDisponibles, 0)}`,
        409
      );
    }

    return this.repositorioTickets.crear({
      user: usuario.id,
      event: eventId,
      status: ESTADOS_TICKET.CONFIRMADO,
      quantity,
      reservationCode: randomUUID(),
      cancelledAt: null
    });
  }

  async listarPropios(userId) {
    return this.repositorioTickets.obtenerPorUsuario(userId);
  }

  async listarPorEvento(eventId, usuario) {
    const evento = await this.repositorioEventos.obtenerPorId(eventId);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    const esAdmin = usuario.role === ROLES.ADMINISTRADOR;
    const esPropietario = evento.organizer?.toString() === usuario.id;

    if (!esAdmin && !esPropietario) {
      throw new ErrorAplicacion('No tenés permisos para realizar esta acción', 403);
    }

    return this.repositorioTickets.obtenerPorEvento(eventId);
  }
}
