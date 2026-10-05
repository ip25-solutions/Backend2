export class TicketsRepository {
  constructor(ticketsDao) {
    this.ticketsDao = ticketsDao;
  }

  async crear(datosTicket) {
    return this.ticketsDao.crear(datosTicket);
  }

  async obtenerActivoPorUsuarioYEvento(userId, eventId) {
    return this.ticketsDao.obtenerActivoPorUsuarioYEvento(userId, eventId);
  }

  async obtenerCantidadActiva(eventId) {
    return this.ticketsDao.obtenerCantidadActiva(eventId);
  }
}
