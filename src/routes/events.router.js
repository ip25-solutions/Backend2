import { Router } from 'express';
import { obtenerEventos } from '../controllers/events.controller.js';

const enrutadorEventos = Router();

enrutadorEventos.get('/', obtenerEventos);

export default enrutadorEventos;
