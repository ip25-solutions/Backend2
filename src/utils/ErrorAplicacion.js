export class ErrorAplicacion extends Error {
  constructor(mensaje, estado = 500) {
    super(mensaje);
    this.name = 'ErrorAplicacion';
    this.estado = estado;
  }
}
