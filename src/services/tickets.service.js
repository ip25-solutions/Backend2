import { randomUUID } from 'node:crypto';
import { ESTADOS_EVENTO } from '../config/eventos.js';
import { ESTADOS_TICKET } from '../config/tickets.js';
import { ROLES } from '../config/permisos.js';
import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';

export class ServicioTickets {
  constructor(repositorioTickets, repositorioEventos, servicioCorreo) {
    this.repositorioTickets = repositorioTickets;
    this.repositorioEventos = repositorioEventos;
    this.servicioCorreo = servicioCorreo;
  }

  async crear(eventId, usuario, quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ErrorAplicacion('La cantidad debe ser un número entero mayor que cero', 400);
    }

    const evento = await this.repositorioEventos.findById(eventId);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    if (evento.status !== ESTADOS_EVENTO.PUBLICADO || new Date(evento.date) <= new Date()) {
      throw new ErrorAplicacion('El evento no está disponible para inscripciones', 409);
    }

    const ticketActivo = await this.repositorioTickets.findActiveByUserAndEvent(
      usuario.id,
      eventId
    );

    if (ticketActivo) {
      throw new ErrorAplicacion('Ya tenés una inscripción activa para este evento', 409);
    }

    const cantidadOcupada = await this.repositorioTickets.countActiveTickets(eventId);
    const cuposDisponibles = evento.capacity - cantidadOcupada;

    if (cuposDisponibles < quantity) {
      throw new ErrorAplicacion(
        `No hay cupos suficientes. Disponibles: ${Math.max(cuposDisponibles, 0)}`,
        409
      );
    }

    const ticket = await this.repositorioTickets.create({
      user: usuario.id,
      event: eventId,
      status: ESTADOS_TICKET.CONFIRMADO,
      quantity,
      reservationCode: randomUUID(),
      cancelledAt: null
    });

    await this.servicioCorreo.enviarConfirmacionInscripcion({
      destinatario: usuario.email,
      ticket,
      evento
    });

    return ticket;
  }

  async listarPropios(userId) {
    return this.repositorioTickets.findByUser(userId);
  }

  async listarPorEvento(eventId, usuario) {
    const evento = await this.repositorioEventos.findById(eventId);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    const esAdmin = usuario.role === ROLES.ADMINISTRADOR;
    const esPropietario = evento.organizer?.toString() === usuario.id;

    if (!esAdmin && !esPropietario) {
      throw new ErrorAplicacion('No tenés permisos para realizar esta acción', 403);
    }

    return this.repositorioTickets.findByEvent(eventId);
  }

  async cancelar(ticketId, usuario) {
    const ticket = await this.repositorioTickets.findById(ticketId);

    if (!ticket) {
      throw new ErrorAplicacion('Ticket no encontrado', 404);
    }

    const esAdmin = usuario.role === ROLES.ADMINISTRADOR;
    const esPropietario = ticket.user?.toString() === usuario.id;

    if (!esAdmin && !esPropietario) {
      throw new ErrorAplicacion('No tenés permisos para realizar esta acción', 403);
    }

    if (ticket.status === ESTADOS_TICKET.CANCELADO) {
      throw new ErrorAplicacion('El ticket ya está cancelado', 409);
    }

    const ticketCancelado = await this.repositorioTickets.cancelTicket(ticketId, new Date());

    if (!ticketCancelado) {
      throw new ErrorAplicacion('Ticket no encontrado', 404);
    }

    return ticketCancelado;
  }
}
