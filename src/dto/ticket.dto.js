import { convertirId, identificarDocumento } from './dto.utils.js';

const convertirEvento = (evento) => {
  if (evento === null || evento === undefined || typeof evento !== 'object') {
    return convertirId(evento);
  }

  return {
    ...identificarDocumento(evento),
    title: evento.title,
    date: evento.date,
    location: evento.location
  };
};

export class TicketDTO {
  static from(ticket) {
    return {
      ...identificarDocumento(ticket),
      user: convertirId(ticket.user),
      event: convertirEvento(ticket.event),
      status: ticket.status,
      quantity: ticket.quantity,
      reservationCode: ticket.reservationCode,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      cancelledAt: ticket.cancelledAt
    };
  }
}
