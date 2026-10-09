export class EventRepository {
  constructor(eventDAO) {
    this.eventDAO = eventDAO;
  }

  async obtenerTodos(opciones) {
    return this.eventDAO.obtenerTodos(opciones);
  }

  async obtenerPorId(id) {
    return this.eventDAO.obtenerPorId(id);
  }

  async crear(datosEvento) {
    return this.eventDAO.crear(datosEvento);
  }

  async actualizar(id, datosEvento) {
    return this.eventDAO.actualizar(id, datosEvento);
  }

  async actualizarEstado(id, status) {
    return this.eventDAO.actualizarEstado(id, status);
  }
}
