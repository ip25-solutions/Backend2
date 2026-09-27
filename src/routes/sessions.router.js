import { Router } from 'express';
import { sessionsController } from '../config/dependencias.js';

const enrutadorSesiones = Router();

enrutadorSesiones.post('/register', sessionsController.register);
enrutadorSesiones.post('/login', sessionsController.login);

export default enrutadorSesiones;
