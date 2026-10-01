import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import enrutadorEventos from './routes/events.router.js';
import enrutadorHealth from './routes/health.router.js';
import enrutadorSesiones from './routes/sessions.router.js';
import { configurarPassport } from './config/passport.config.js';
import { manejarErrores } from './middlewares/manejadorErrores.js';
import { manejarRutaNoEncontrada } from './middlewares/rutaNoEncontrada.js';

const aplicacion = express();

configurarPassport();

aplicacion.use(express.json());
aplicacion.use(cookieParser());
aplicacion.use(passport.initialize());

aplicacion.use('/api/health', enrutadorHealth);
aplicacion.use('/api/events', enrutadorEventos);
aplicacion.use('/api/sessions', enrutadorSesiones);
aplicacion.use(manejarRutaNoEncontrada);
aplicacion.use(manejarErrores);

export default aplicacion;
