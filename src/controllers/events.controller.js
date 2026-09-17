export class ControladorEventos {
  constructor(servicioEventos) {
    this.servicioEventos = servicioEventos;
    this.obtenerTodos = this.obtenerTodos.bind(this);
    this.obtenerPorId = this.obtenerPorId.bind(this);
    this.crear = this.crear.bind(this);
    this.actualizar = this.actualizar.bind(this);
    this.eliminar = this.eliminar.bind(this);
  }

  async obtenerTodos(solicitud, respuesta, siguiente) {
    try {
      const eventos = await this.servicioEventos.listar();
      respuesta.status(200).json({ status: 'success', payload: eventos });
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
      const evento = await this.servicioEventos.crear(solicitud.body);
      respuesta.status(201).json({ status: 'success', payload: evento });
    } catch (error) {
      siguiente(error);
    }
  }

  async actualizar(solicitud, respuesta, siguiente) {
    try {
      const evento = await this.servicioEventos.actualizar(solicitud.params.id, solicitud.body);
      respuesta.status(200).json({ status: 'success', payload: evento });
    } catch (error) {
      siguiente(error);
    }
  }

  async eliminar(solicitud, respuesta, siguiente) {
    try {
      await this.servicioEventos.eliminar(solicitud.params.id);
      respuesta.status(200).json({ status: 'success', message: 'Evento eliminado' });
    } catch (error) {
      siguiente(error);
    }
  }
}
