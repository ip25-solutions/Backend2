export class TicketRepository {
  constructor(ticketDAO) {
    this.ticketDAO = ticketDAO;
  }

  async crear(datosTicket) {
    return this.ticketDAO.crear(datosTicket);
  }

  async obtenerActivoPorUsuarioYEvento(userId, eventId) {
    return this.ticketDAO.obtenerActivoPorUsuarioYEvento(userId, eventId);
  }

  async obtenerCantidadActiva(eventId) {
    return this.ticketDAO.obtenerCantidadActiva(eventId);
  }

  async obtenerPorUsuario(userId) {
    return this.ticketDAO.obtenerPorUsuario(userId);
  }

  async obtenerPorEvento(eventId) {
    return this.ticketDAO.obtenerPorEvento(eventId);
  }

  async obtenerPorId(id) {
    return this.ticketDAO.obtenerPorId(id);
  }

  async cancelar(id, cancelledAt) {
    return this.ticketDAO.cancelar(id, cancelledAt);
  }
}
