import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.JWT_SECRET = 'clave_exclusiva_para_pruebas';
process.env.JWT_EXPIRES_IN = '1h';

const { ROLES } = await import('../src/config/permisos.js');
const { autenticar } = await import('../src/middlewares/auth.middleware.js');
const { autorizar } = await import('../src/middlewares/authorize.middleware.js');
const { generarToken } = await import('../src/utils/jwt.js');

const ejecutarMiddleware = (middleware, request) => {
  let error;
  middleware(request, {}, (resultado) => {
    error = resultado;
  });
  return error;
};

test('autenticar valida la cookie y completa request.user', () => {
  const payload = { id: 'usuario-1', email: 'ana@mail.com', role: ROLES.ORGANIZADOR };
  const request = { cookies: { currentUser: generarToken(payload) } };

  const error = ejecutarMiddleware(autenticar, request);

  assert.equal(error, undefined);
  assert.deepEqual(request.user, payload);
});

test('autenticar responde 401 cuando la sesión no es válida', () => {
  for (const request of [{ cookies: {} }, { cookies: { currentUser: 'token.invalido' } }]) {
    const error = ejecutarMiddleware(autenticar, request);
    assert.equal(error.estado, 401);
    assert.equal(error.message, 'No autenticado');
  }
});

test('autorizar diferencia una sesión sin permisos con 403', () => {
  const middleware = autorizar(ROLES.ADMINISTRADOR);
  const error = ejecutarMiddleware(middleware, { user: { role: ROLES.ORGANIZADOR } });

  assert.equal(error.estado, 403);
  assert.equal(error.message, 'No tenés permisos para realizar esta acción');
  assert.equal(ejecutarMiddleware(middleware, { user: { role: ROLES.ADMINISTRADOR } }), undefined);
});
