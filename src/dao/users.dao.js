export class UsersDao {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async findByEmail(email) {
    return this.userModel.findOne({ email }).lean();
  }

  async findByEmailWithPassword(email) {
    return this.userModel.findOne({ email }).select('+password').lean();
  }

  async findById(id) {
    return this.userModel.findById(id).lean();
  }

  async findAll() {
    return this.userModel.find().select('-password').sort({ email: 1 }).lean();
  }

  async create(userData) {
    const user = await this.userModel.create(userData);
    return user.toObject();
  }
}
