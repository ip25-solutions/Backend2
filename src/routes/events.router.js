import { Router } from 'express';
import { controladorEventos, ticketsController } from '../config/dependencias.js';
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
enrutadorEventos.post('/:eid/tickets', autenticar, ticketsController.crear);
enrutadorEventos.get(
  '/:eid/tickets',
  autenticar,
  autorizar(...PERMISOS.VER_TICKETS_EVENTO),
  ticketsController.listarPorEvento
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
