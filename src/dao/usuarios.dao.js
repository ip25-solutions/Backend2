export class UsuariosDao {
  constructor(modeloUsuario) {
    this.modeloUsuario = modeloUsuario;
  }

  async obtenerPorEmail(email) {
    return this.modeloUsuario.findOne({ email }).lean();
  }

  async obtenerPorId(id) {
    return this.modeloUsuario.findById(id).lean();
  }

  async crear(datosUsuario) {
    const usuario = await this.modeloUsuario.create(datosUsuario);
    return usuario.toObject();
  }
}
