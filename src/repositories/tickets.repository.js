export class TicketRepository {
  constructor(ticketDAO) {
    this.ticketDAO = ticketDAO;
  }

  async create(datosTicket) {
    return this.ticketDAO.create(datosTicket);
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return this.ticketDAO.findActiveByUserAndEvent(userId, eventId);
  }

  async countActiveTickets(eventId) {
    return this.ticketDAO.countActiveTickets(eventId);
  }

  async findByUser(userId) {
    return this.ticketDAO.findByUser(userId);
  }

  async findByEvent(eventId) {
    return this.ticketDAO.findByEvent(eventId);
  }

  async findById(id) {
    return this.ticketDAO.findById(id);
  }

  async cancelTicket(id, cancelledAt) {
    return this.ticketDAO.cancel(id, cancelledAt);
  }
}
