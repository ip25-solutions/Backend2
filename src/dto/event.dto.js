import { convertirId, identificarDocumento } from './dto.utils.js';

export class EventDTO {
  static from(evento) {
    return {
      ...identificarDocumento(evento),
      title: evento.title,
      description: evento.description,
      category: evento.category,
      date: evento.date,
      location: evento.location,
      capacity: evento.capacity,
      price: evento.price,
      status: evento.status,
      organizer: convertirId(evento.organizer),
      createdAt: evento.createdAt,
      updatedAt: evento.updatedAt
    };
  }
}
