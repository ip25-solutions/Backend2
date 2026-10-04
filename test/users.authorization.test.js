import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

process.env.JWT_SECRET = 'clave_exclusiva_para_pruebas';
process.env.JWT_EXPIRES_IN = '1h';

const { default: aplicacion } = await import('../src/app.js');
const { usersRepository } = await import('../src/config/dependencias.js');
const { ROLES } = await import('../src/config/permisos.js');
const { generarToken } = await import('../src/utils/jwt.js');

let server;
let baseUrl;

usersRepository.findAll = async () => [
  {
    _id: { toString: () => 'usuario-1' },
    first_name: 'Ana',
    last_name: 'Pérez',
    email: 'ana@mail.com',
    password: 'hash-que-no-debe-exponerse',
    role: ROLES.USUARIO
  }
];

const cookiePara = (role) => {
  const token = generarToken({ id: `${role}-1`, email: `${role}@mail.com`, role });
  return `currentUser=${token}`;
};

const listarUsuarios = (cookie) =>
  fetch(`${baseUrl}/api/users`, { headers: cookie ? { cookie } : {} });

before(() => {
  server = aplicacion.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(
  () =>
    new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    })
);

test('listar usuarios sin sesión responde 401', async () => {
  const response = await listarUsuarios();

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { status: 'error', message: 'No autenticado' });
});

test('un organizer no puede listar usuarios', async () => {
  const response = await listarUsuarios(cookiePara(ROLES.ORGANIZADOR));

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    status: 'error',
    message: 'No tenés permisos para realizar esta acción'
  });
});

test('un admin puede listar usuarios sin exponer contraseñas', async () => {
  const response = await listarUsuarios(cookiePara(ROLES.ADMINISTRADOR));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: 'success',
    payload: [
      {
        id: 'usuario-1',
        first_name: 'Ana',
        last_name: 'Pérez',
        email: 'ana@mail.com',
        role: ROLES.USUARIO
      }
    ]
  });
  assert.equal('password' in body.payload[0], false);
});
