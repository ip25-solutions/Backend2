export class Usuario {
  constructor({ nombre, apellido, email, password, rol = 'asistente' }) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.password = password;
    this.rol = rol;
  }
}
