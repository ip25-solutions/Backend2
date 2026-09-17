import { Router } from 'express';
import { obtenerEstadoServidor } from '../controllers/health.controller.js';

const enrutadorHealth = Router();

enrutadorHealth.get('/', obtenerEstadoServidor);

export default enrutadorHealth;
