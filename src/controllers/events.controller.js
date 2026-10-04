export class ControladorEventos {
  constructor(servicioEventos) {
    this.servicioEventos = servicioEventos;
    this.obtenerTodos = this.obtenerTodos.bind(this);
    this.obtenerPorId = this.obtenerPorId.bind(this);
    this.crear = this.crear.bind(this);
    this.actualizar = this.actualizar.bind(this);
    this.cambiarEstado = this.cambiarEstado.bind(this);
  }

  async obtenerTodos(solicitud, respuesta, siguiente) {
    try {
      const resultado = await this.servicioEventos.listar(solicitud.query);
      respuesta.status(200).json({ status: 'success', ...resultado });
    } catch (error) {
      siguiente(error);
    }
  }

  async obtenerPorId(solicitud, respuesta, siguiente) {
    try {
      const evento = await this.servicioEventos.obtenerPorId(solicitud.params.id);
      respuesta.status(200).json({ status: 'success', payload: evento });
    } catch (error) {
      siguiente(error);
    }
  }

  async crear(solicitud, respuesta, siguiente) {
    try {
      const evento = await this.servicioEventos.crear(solicitud.body, solicitud.user.id);
      respuesta.status(201).json({ status: 'success', payload: evento });
    } catch (error) {
      siguiente(error);
    }
  }

  async actualizar(solicitud, respuesta, siguiente) {
    try {
      const evento = await this.servicioEventos.actualizar(
        solicitud.params.id,
        solicitud.body,
        solicitud.user
      );
      respuesta.status(200).json({ status: 'success', payload: evento });
    } catch (error) {
      siguiente(error);
    }
  }

  async cambiarEstado(solicitud, respuesta, siguiente) {
    try {
      const evento = await this.servicioEventos.cambiarEstado(
        solicitud.params.id,
        solicitud.body.status,
        solicitud.user
      );
      respuesta.status(200).json({ status: 'success', payload: evento });
    } catch (error) {
      siguiente(error);
    }
  }
}
