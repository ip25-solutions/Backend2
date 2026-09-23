import { Router } from 'express';
import { sessionsController } from '../config/dependencias.js';

const enrutadorSesiones = Router();

enrutadorSesiones.post('/register', sessionsController.register);

export default enrutadorSesiones;
