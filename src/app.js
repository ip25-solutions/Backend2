import express from 'express';
import enrutadorEventos from './routes/events.router.js';
import enrutadorHealth from './routes/health.router.js';
import enrutadorSesiones from './routes/sessions.router.js';
import { manejarErrores } from './middlewares/manejadorErrores.js';
import { manejarRutaNoEncontrada } from './middlewares/rutaNoEncontrada.js';

const aplicacion = express();

aplicacion.use(express.json());

aplicacion.use('/api/health', enrutadorHealth);
aplicacion.use('/api/events', enrutadorEventos);
aplicacion.use('/api/sessions', enrutadorSesiones);
aplicacion.use(manejarRutaNoEncontrada);
aplicacion.use(manejarErrores);

export default aplicacion;
