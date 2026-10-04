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
let eventoPersistido;

controladorEventos.servicioEventos.repositorioEventos.crear = async (datosEvento) => {
  ultimoEventoCreado = datosEvento;
  return { id: 'evento-1', ...datosEvento };
};
controladorEventos.servicioEventos.repositorioEventos.obtenerPorId = async (id) =>
  eventoPersistido?.id === id ? eventoPersistido : null;
controladorEventos.servicioEventos.repositorioEventos.actualizar = async (id, cambios) => {
  if (eventoPersistido?.id !== id) return null;
  eventoPersistido = { ...eventoPersistido, ...cambios };
  return eventoPersistido;
};
controladorEventos.servicioEventos.repositorioEventos.eliminar = async (id) => {
  if (eventoPersistido?.id !== id) return null;
  const eventoEliminado = eventoPersistido;
  eventoPersistido = null;
  return eventoEliminado;
};

const datosEvento = {
  title: 'Congreso Tech',
  description: 'Tecnología y desarrollo',
  category: 'conference',
  date: new Date(Date.now() + 86_400_000).toISOString(),
  location: 'Montevideo',
  capacity: 100,
  price: 1500
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

const modificarEvento = (id, cookie, body = { title: 'Evento actualizado' }) =>
  fetch(`${baseUrl}/api/events/${id}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    body: JSON.stringify(body)
  });

const eliminarEvento = (id, cookie) =>
  fetch(`${baseUrl}/api/events/${id}`, {
    method: 'DELETE',
    headers: cookie ? { cookie } : {}
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
      organizer: 'identificador-enviado-por-el-cliente'
    });

    assert.equal(response.status, 201);
    assert.equal((await response.json()).payload.organizer, id);
    assert.equal(ultimoEventoCreado.organizer, id);
    assert.equal(ultimoEventoCreado.status, 'draft');
  }
});

test('crear un evento con fecha pasada responde 400', async () => {
  const response = await crearEvento(cookiePara(ROLES.ORGANIZADOR), {
    ...datosEvento,
    date: new Date(Date.now() - 86_400_000).toISOString()
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'La fecha del evento debe ser futura');
});

test('crear un evento con capacidad cero responde 400', async () => {
  const response = await crearEvento(cookiePara(ROLES.ORGANIZADOR), {
    ...datosEvento,
    capacity: 0
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'La capacidad debe ser mayor que cero');
});

test('crear un evento con precio negativo responde 400', async () => {
  const response = await crearEvento(cookiePara(ROLES.ORGANIZADOR), {
    ...datosEvento,
    price: -1
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'El precio no puede ser negativo');
});

test('modificar un evento privado sin sesión responde 401', async () => {
  const response = await modificarEvento('evento-privado');

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { status: 'error', message: 'No autenticado' });
});

test('un organizer no puede modificar un evento ajeno', async () => {
  eventoPersistido = { id: 'evento-ajeno', title: 'Original', organizer: 'organizer-otro' };

  const response = await modificarEvento(
    eventoPersistido.id,
    cookiePara(ROLES.ORGANIZADOR, 'organizer-1')
  );

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    status: 'error',
    message: 'No tenés permisos para realizar esta acción'
  });
  assert.equal(eventoPersistido.title, 'Original');
});

test('un organizer puede modificar y eliminar sus propios eventos', async () => {
  const organizerId = 'organizer-propietario';
  const cookie = cookiePara(ROLES.ORGANIZADOR, organizerId);
  eventoPersistido = { id: 'evento-propio', title: 'Original', organizer: organizerId };

  const updateResponse = await modificarEvento(eventoPersistido.id, cookie);
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).payload.title, 'Evento actualizado');

  const deleteResponse = await eliminarEvento(eventoPersistido.id, cookie);
  assert.equal(deleteResponse.status, 200);
  assert.equal(eventoPersistido, null);
});

test('un admin puede modificar y eliminar cualquier evento', async () => {
  const cookie = cookiePara(ROLES.ADMINISTRADOR, 'admin-1');
  eventoPersistido = { id: 'evento-de-otro', title: 'Original', organizer: 'organizer-2' };

  const updateResponse = await modificarEvento(eventoPersistido.id, cookie);
  assert.equal(updateResponse.status, 200);

  const deleteResponse = await eliminarEvento(eventoPersistido.id, cookie);
  assert.equal(deleteResponse.status, 200);
});
