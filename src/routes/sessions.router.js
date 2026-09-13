import { Router } from 'express';
import { consultarSesion } from '../controllers/sessions.controller.js';

const enrutadorSesiones = Router();

enrutadorSesiones.get('/', consultarSesion);

export default enrutadorSesiones;
