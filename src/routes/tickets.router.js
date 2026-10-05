import { Router } from 'express';
import { ticketsController } from '../config/dependencias.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const enrutadorTickets = Router();

enrutadorTickets.get('/my-tickets', autenticar, ticketsController.listarPropios);

export default enrutadorTickets;
