export class EventosDao {
  constructor(modeloEvento) {
    this.modeloEvento = modeloEvento;
  }

  async obtenerTodos() {
    return this.modeloEvento.find().sort({ fecha: 1 }).lean();
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
