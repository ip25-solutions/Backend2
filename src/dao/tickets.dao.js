import mongoose from 'mongoose';
import { ESTADOS_TICKET_ACTIVO } from '../config/tickets.js';

export class TicketsDao {
  constructor(modeloTicket) {
    this.modeloTicket = modeloTicket;
  }

  async crear(datosTicket) {
    const ticket = await this.modeloTicket.create(datosTicket);
    return ticket.toObject();
  }

  async obtenerActivoPorUsuarioYEvento(userId, eventId) {
    return this.modeloTicket
      .findOne({
        user: userId,
        event: eventId,
        status: { $in: ESTADOS_TICKET_ACTIVO }
      })
      .lean();
  }

  async obtenerCantidadActiva(eventId) {
    const [resultado] = await this.modeloTicket.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
          status: { $in: ESTADOS_TICKET_ACTIVO }
        }
      },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    return resultado?.total ?? 0;
  }
}
