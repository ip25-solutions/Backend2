import express from 'express';
import enrutadorEventos from './routes/events.router.js';
import enrutadorSesiones from './routes/sessions.router.js';
import { manejarErrores } from './middlewares/manejadorErrores.js';

const aplicacion = express();

aplicacion.use(express.json());

aplicacion.get('/api/health', (solicitud, respuesta) => {
  respuesta.status(200).json({ status: 'ok', message: 'Servidor activo' });
});

aplicacion.use('/api/events', enrutadorEventos);
aplicacion.use('/api/sessions', enrutadorSesiones);
aplicacion.use(manejarErrores);

export default aplicacion;
