export const ESTADOS_TICKET = Object.freeze({
  CONFIRMADO: 'confirmed',
  PENDIENTE: 'pending',
  CANCELADO: 'cancelled'
});

export const ESTADOS_TICKET_ACTIVO = Object.freeze([
  ESTADOS_TICKET.CONFIRMADO,
  ESTADOS_TICKET.PENDIENTE
]);
