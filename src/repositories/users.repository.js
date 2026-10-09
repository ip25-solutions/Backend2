export class UserRepository {
  constructor(userDAO) {
    this.userDAO = userDAO;
  }

  async findByEmail(email) {
    return this.userDAO.findByEmail(email);
  }

  async findByEmailWithPassword(email) {
    return this.userDAO.findByEmailWithPassword(email);
  }

  async findById(id) {
    return this.userDAO.findById(id);
  }

  async findAll() {
    return this.userDAO.findAll();
  }

  async create(userData) {
    return this.userDAO.create(userData);
  }
}
