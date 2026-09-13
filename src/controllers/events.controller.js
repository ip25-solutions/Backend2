import { RepositorioEventos } from '../repositories/eventos.repositorio.js';
import { ServicioEventos } from '../services/eventos.servicio.js';

const servicioEventos = new ServicioEventos(new RepositorioEventos());

export const obtenerEventos = async (solicitud, respuesta, siguiente) => {
  try {
    const eventos = await servicioEventos.listar();
    respuesta.status(200).json({ status: 'success', payload: eventos });
  } catch (error) {
    siguiente(error);
  }
};
