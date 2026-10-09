import mongoose from 'mongoose';
import { ESTADOS_TICKET_ACTIVO } from '../config/tickets.js';
import { Ticket } from '../models/Ticket.js';

export class TicketDAO {
  constructor(modeloTicket = Ticket) {
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

  async obtenerPorUsuario(userId) {
    return this.modeloTicket
      .find({ user: userId })
      .populate('event', 'title date location')
      .sort({ createdAt: -1 })
      .lean();
  }

  async obtenerPorEvento(eventId) {
    return this.modeloTicket.find({ event: eventId }).sort({ createdAt: -1 }).lean();
  }

  async obtenerPorId(id) {
    return this.modeloTicket.findById(id).lean();
  }

  async cancelar(id, cancelledAt) {
    return this.modeloTicket
      .findByIdAndUpdate(
        id,
        { status: 'cancelled', cancelledAt },
        { returnDocument: 'after', runValidators: true }
      )
      .lean();
  }
}
