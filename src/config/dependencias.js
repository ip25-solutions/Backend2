import { SessionsController } from '../controllers/sessions.controller.js';
import { ControladorEventos } from '../controllers/events.controller.js';
import { UsersDao } from '../dao/users.dao.js';
import { EventosDao } from '../dao/eventos.dao.js';
import { User } from '../models/User.js';
import { Evento } from '../models/Event.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { RepositorioEventos } from '../repositories/eventos.repositorio.js';
import { SessionsService } from '../services/sessions.service.js';
import { ServicioEventos } from '../services/eventos.servicio.js';

const eventosDao = new EventosDao(Evento);
const repositorioEventos = new RepositorioEventos(eventosDao);
const servicioEventos = new ServicioEventos(repositorioEventos);

export const controladorEventos = new ControladorEventos(servicioEventos);

const usersDao = new UsersDao(User);
const usersRepository = new UsersRepository(usersDao);
const sessionsService = new SessionsService(usersRepository);

export const sessionsController = new SessionsController(sessionsService);
