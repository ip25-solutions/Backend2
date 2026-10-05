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

  async obtenerPorUsuario(userId) {
    return this.ticketsDao.obtenerPorUsuario(userId);
  }

  async obtenerPorEvento(eventId) {
    return this.ticketsDao.obtenerPorEvento(eventId);
  }

  async obtenerPorId(id) {
    return this.ticketsDao.obtenerPorId(id);
  }

  async cancelar(id, cancelledAt) {
    return this.ticketsDao.cancelar(id, cancelledAt);
  }
}
