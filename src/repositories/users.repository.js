export class UsersRepository {
  constructor(usersDao) {
    this.usersDao = usersDao;
  }

  async findByEmail(email) {
    return this.usersDao.findByEmail(email);
  }

  async findById(id) {
    return this.usersDao.findById(id);
  }

  async create(userData) {
    return this.usersDao.create(userData);
  }
}
