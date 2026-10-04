import { Router } from 'express';
import { usersController } from '../config/dependencias.js';
import { PERMISOS } from '../config/permisos.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/authorize.middleware.js';

const enrutadorUsuarios = Router();

enrutadorUsuarios.get(
  '/',
  autenticar,
  autorizar(...PERMISOS.VER_USUARIOS),
  usersController.listar
);

export default enrutadorUsuarios;
