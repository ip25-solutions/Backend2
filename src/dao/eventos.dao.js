import { Event } from '../models/Event.js';

export class EventDAO {
  constructor(modeloEvento = Event) {
    this.modeloEvento = modeloEvento;
  }

  async findMany({ filtros, orden, page, limit }) {
    const consulta = this.modeloEvento
      .find(filtros)
      .sort(orden)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const [data, total] = await Promise.all([
      consulta,
      this.modeloEvento.countDocuments(filtros)
    ]);

    return { data, total };
  }

  async findById(id) {
    return this.modeloEvento.findById(id).lean();
  }

  async create(datosEvento) {
    const evento = await this.modeloEvento.create(datosEvento);
    return evento.toObject();
  }

  async update(id, datosEvento) {
    return this.modeloEvento
      .findByIdAndUpdate(id, datosEvento, { returnDocument: 'after', runValidators: true })
      .lean();
  }

  async changeStatus(id, status) {
    return this.modeloEvento
      .findByIdAndUpdate(id, { status }, { returnDocument: 'after', runValidators: true })
      .lean();
  }
}
