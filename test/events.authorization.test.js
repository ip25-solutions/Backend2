import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

process.env.JWT_SECRET = 'clave_exclusiva_para_pruebas';
process.env.JWT_EXPIRES_IN = '1h';

const { default: aplicacion } = await import('../src/app.js');
const { controladorEventos } = await import('../src/config/dependencias.js');
const { ROLES } = await import('../src/config/permisos.js');
const { generarToken } = await import('../src/utils/jwt.js');

let server;
let baseUrl;
let ultimoEventoCreado;

controladorEventos.servicioEventos.repositorioEventos.crear = async (datosEvento) => {
  ultimoEventoCreado = datosEvento;
  return { id: 'evento-1', ...datosEvento };
};

const datosEvento = {
  titulo: 'Congreso Tech 2026',
  descripcion: 'Tecnología y desarrollo',
  fecha: '2026-11-20T18:00:00.000Z',
  ubicacion: 'Montevideo',
  capacidad: 100
};

const cookiePara = (role, id = `${role}-1`) => {
  const token = generarToken({ id, email: `${role}@mail.com`, role });
  return `currentUser=${token}`;
};

const crearEvento = (cookie, body = datosEvento) =>
  fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    body: JSON.stringify(body)
  });

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

test('crear un evento sin sesión responde 401', async () => {
  const response = await crearEvento();

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { status: 'error', message: 'No autenticado' });
});

test('crear un evento con rol user responde 403', async () => {
  const response = await crearEvento(cookiePara(ROLES.USUARIO));

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    status: 'error',
    message: 'No tenés permisos para realizar esta acción'
  });
});

test('organizer y admin pueden crear eventos', async () => {
  for (const role of [ROLES.ORGANIZADOR, ROLES.ADMINISTRADOR]) {
    const id = `${role}-propietario`;
    const response = await crearEvento(cookiePara(role, id), {
      ...datosEvento,
      organizador: 'identificador-enviado-por-el-cliente'
    });

    assert.equal(response.status, 201);
    assert.equal((await response.json()).payload.organizador, id);
    assert.equal(ultimoEventoCreado.organizador, id);
  }
});
