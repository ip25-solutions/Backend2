import { crearResumenEventoDto } from './event.dto.js';
import { obtenerId } from './dto.utils.js';

const convertirEvento = (evento) =>
  evento && typeof evento === 'object' ? crearResumenEventoDto(evento) : obtenerId(evento);

export const crearTicketDto = (ticket) => ({
  id: obtenerId(ticket),
  event: convertirEvento(ticket.event),
  user: obtenerId(ticket.user),
  quantity: ticket.quantity,
  status: ticket.status,
  reservationCode: ticket.reservationCode,
  createdAt: ticket.createdAt,
  cancelledAt: ticket.cancelledAt
});
