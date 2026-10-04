import { Router } from 'express';
import { sessionsController } from '../config/dependencias.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autenticarConPassport } from '../middlewares/passport.middleware.js';

const enrutadorSesiones = Router();

enrutadorSesiones.post(
  '/register',
  autenticarConPassport('register', 'Faltan campos obligatorios', 400),
  sessionsController.register
);
enrutadorSesiones.post(
  '/login',
  autenticarConPassport('login', 'Credenciales inválidas', 401),
  sessionsController.login
);
enrutadorSesiones.get(
  '/current',
  autenticar,
  sessionsController.current
);
enrutadorSesiones.post('/logout', sessionsController.logout);

export default enrutadorSesiones;
