import { Router } from 'express';
import { controladorEventos } from '../config/dependencias.js';

const enrutadorEventos = Router();

enrutadorEventos.get('/', controladorEventos.obtenerTodos);
enrutadorEventos.get('/:id', controladorEventos.obtenerPorId);
enrutadorEventos.post('/', controladorEventos.crear);
enrutadorEventos.put('/:id', controladorEventos.actualizar);
enrutadorEventos.delete('/:id', controladorEventos.eliminar);

export default enrutadorEventos;
