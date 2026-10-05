import { SessionsController } from '../controllers/sessions.controller.js';
import { ControladorEventos } from '../controllers/events.controller.js';
import { UsersController } from '../controllers/users.controller.js';
import { TicketsController } from '../controllers/tickets.controller.js';
import { UsersDao } from '../dao/users.dao.js';
import { EventosDao } from '../dao/eventos.dao.js';
import { TicketsDao } from '../dao/tickets.dao.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Ticket } from '../models/Ticket.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { RepositorioEventos } from '../repositories/eventos.repositorio.js';
import { TicketsRepository } from '../repositories/tickets.repository.js';
import { ServicioEventos } from '../services/eventos.servicio.js';
import { ServicioTickets } from '../services/tickets.service.js';
import { ServicioCorreo } from '../services/correo.service.js';
import { entorno } from './entorno.js';

const eventosDao = new EventosDao(Event);
export const repositorioEventos = new RepositorioEventos(eventosDao);
const servicioEventos = new ServicioEventos(repositorioEventos);

export const controladorEventos = new ControladorEventos(servicioEventos);

const ticketsDao = new TicketsDao(Ticket);
export const repositorioTickets = new TicketsRepository(ticketsDao);
const servicioCorreo = new ServicioCorreo(entorno);
const servicioTickets = new ServicioTickets(
  repositorioTickets,
  repositorioEventos,
  servicioCorreo
);
export const ticketsController = new TicketsController(servicioTickets);

const usersDao = new UsersDao(User);
export const usersRepository = new UsersRepository(usersDao);
export const usersController = new UsersController(usersRepository);

export const sessionsController = new SessionsController();
