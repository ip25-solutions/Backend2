import { Router } from 'express';
import { controladorEventos } from '../config/dependencias.js';
import { PERMISOS } from '../config/permisos.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/authorize.middleware.js';

const enrutadorEventos = Router();

enrutadorEventos.get('/', controladorEventos.obtenerTodos);
enrutadorEventos.get('/:id', controladorEventos.obtenerPorId);
enrutadorEventos.post(
  '/',
  autenticar,
  autorizar(...PERMISOS.CREAR_EVENTOS),
  controladorEventos.crear
);
enrutadorEventos.put(
  '/:id',
  autenticar,
  autorizar(...PERMISOS.MODIFICAR_EVENTOS),
  controladorEventos.actualizar
);
enrutadorEventos.patch(
  '/:id/status',
  autenticar,
  autorizar(...PERMISOS.MODIFICAR_EVENTOS),
  controladorEventos.cambiarEstado
);

export default enrutadorEventos;
