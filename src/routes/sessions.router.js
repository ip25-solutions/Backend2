import { Router } from 'express';
import { sessionsController } from '../config/dependencias.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const enrutadorSesiones = Router();

enrutadorSesiones.post('/register', sessionsController.register);
enrutadorSesiones.post('/login', sessionsController.login);
enrutadorSesiones.get('/current', autenticar, sessionsController.current);
enrutadorSesiones.post('/logout', sessionsController.logout);

export default enrutadorSesiones;
