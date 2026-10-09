import { SessionsController } from '../controllers/sessions.controller.js';
import { ControladorEventos } from '../controllers/events.controller.js';
import { UsersController } from '../controllers/users.controller.js';
import { TicketsController } from '../controllers/tickets.controller.js';
import { UserDAO } from '../dao/users.dao.js';
import { EventDAO } from '../dao/eventos.dao.js';
import { TicketDAO } from '../dao/tickets.dao.js';
import { UserRepository } from '../repositories/users.repository.js';
import { EventRepository } from '../repositories/eventos.repositorio.js';
import { TicketRepository } from '../repositories/tickets.repository.js';
import { ServicioEventos } from '../services/eventos.servicio.js';
import { ServicioTickets } from '../services/tickets.service.js';
import { ServicioCorreo } from '../services/correo.service.js';
import { SessionsService } from '../services/sessions.service.js';
import { UsersService } from '../services/users.service.js';
import { entorno } from './entorno.js';

const eventDAO = new EventDAO();
export const repositorioEventos = new EventRepository(eventDAO);
const servicioEventos = new ServicioEventos(repositorioEventos);

export const controladorEventos = new ControladorEventos(servicioEventos);

const ticketDAO = new TicketDAO();
export const repositorioTickets = new TicketRepository(ticketDAO);
const servicioCorreo = new ServicioCorreo(entorno);
const servicioTickets = new ServicioTickets(
  repositorioTickets,
  repositorioEventos,
  servicioCorreo
);
export const ticketsController = new TicketsController(servicioTickets);

const userDAO = new UserDAO();
export const usersRepository = new UserRepository(userDAO);
export const sessionsService = new SessionsService(usersRepository);
const usersService = new UsersService(usersRepository);
export const usersController = new UsersController(usersService);

export const sessionsController = new SessionsController();
