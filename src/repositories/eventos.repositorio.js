export class RepositorioEventos {
  constructor(eventosDao) {
    this.eventosDao = eventosDao;
  }

  async obtenerTodos(opciones) {
    return this.eventosDao.obtenerTodos(opciones);
  }

  async obtenerPorId(id) {
    return this.eventosDao.obtenerPorId(id);
  }

  async crear(datosEvento) {
    return this.eventosDao.crear(datosEvento);
  }

  async actualizar(id, datosEvento) {
    return this.eventosDao.actualizar(id, datosEvento);
  }

  async eliminar(id) {
    return this.eventosDao.eliminar(id);
  }
}
