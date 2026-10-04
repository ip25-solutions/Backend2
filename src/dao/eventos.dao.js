export class EventosDao {
  constructor(modeloEvento) {
    this.modeloEvento = modeloEvento;
  }

  async obtenerTodos({ filtros, orden, page, limit }) {
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

  async obtenerPorId(id) {
    return this.modeloEvento.findById(id).lean();
  }

  async crear(datosEvento) {
    const evento = await this.modeloEvento.create(datosEvento);
    return evento.toObject();
  }

  async actualizar(id, datosEvento) {
    return this.modeloEvento
      .findByIdAndUpdate(id, datosEvento, { returnDocument: 'after', runValidators: true })
      .lean();
  }

  async eliminar(id) {
    return this.modeloEvento.findByIdAndDelete(id).lean();
  }
}
