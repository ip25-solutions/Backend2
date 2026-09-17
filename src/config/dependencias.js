import { ControladorEventos } from '../controllers/events.controller.js';
import { EventosDao } from '../dao/eventos.dao.js';
import { Evento } from '../models/Event.js';
import { RepositorioEventos } from '../repositories/eventos.repositorio.js';
import { ServicioEventos } from '../services/eventos.servicio.js';

const eventosDao = new EventosDao(Evento);
const repositorioEventos = new RepositorioEventos(eventosDao);
const servicioEventos = new ServicioEventos(repositorioEventos);

export const controladorEventos = new ControladorEventos(servicioEventos);
