import { obtenerId } from './dto.utils.js';

export const crearEventoDto = (evento) => ({
  id: obtenerId(evento),
  title: evento.title,
  description: evento.description,
  category: evento.category,
  date: evento.date,
  location: evento.location,
  capacity: evento.capacity,
  price: evento.price,
  status: evento.status,
  organizer: obtenerId(evento.organizer),
  createdAt: evento.createdAt,
  updatedAt: evento.updatedAt
});

export const crearResumenEventoDto = (evento) => ({
  id: obtenerId(evento),
  title: evento.title,
  date: evento.date,
  location: evento.location
});
