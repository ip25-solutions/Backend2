export class UsersRepository {
  constructor(usersDao) {
    this.usersDao = usersDao;
  }

  async findByEmail(email) {
    return this.usersDao.findByEmail(email);
  }

  async findByEmailWithPassword(email) {
    return this.usersDao.findByEmailWithPassword(email);
  }

  async findById(id) {
    return this.usersDao.findById(id);
  }

  async findAll() {
    return this.usersDao.findAll();
  }

  async create(userData) {
    return this.usersDao.create(userData);
  }
}
