export class EventRepository {
  constructor(eventDAO) {
    this.eventDAO = eventDAO;
  }

  async findMany(opciones) {
    return this.eventDAO.findMany(opciones);
  }

  async findById(id) {
    return this.eventDAO.findById(id);
  }

  async create(datosEvento) {
    return this.eventDAO.create(datosEvento);
  }

  async update(id, datosEvento) {
    return this.eventDAO.update(id, datosEvento);
  }

  async changeStatus(id, status) {
    return this.eventDAO.changeStatus(id, status);
  }
}
