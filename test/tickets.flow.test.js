import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

process.env.JWT_SECRET = 'clave_exclusiva_para_pruebas';
process.env.JWT_EXPIRES_IN = '1h';

const { default: aplicacion } = await import('../src/app.js');
const { repositorioEventos, repositorioTickets } = await import('../src/config/dependencias.js');
const { ROLES } = await import('../src/config/permisos.js');
const { generarToken } = await import('../src/utils/jwt.js');

let server;
let baseUrl;
let evento;
let tickets;

repositorioEventos.obtenerPorId = async (id) => (evento?.id === id ? evento : null);
repositorioTickets.obtenerActivoPorUsuarioYEvento = async (userId, eventId) =>
  tickets.find(
    (ticket) =>
      ticket.user === userId &&
      ticket.event === eventId &&
      ['confirmed', 'pending'].includes(ticket.status)
  ) ?? null;
repositorioTickets.obtenerCantidadActiva = async (eventId) =>
  tickets
    .filter(
      (ticket) => ticket.event === eventId && ['confirmed', 'pending'].includes(ticket.status)
    )
    .reduce((total, ticket) => total + ticket.quantity, 0);
repositorioTickets.crear = async (datosTicket) => {
  const ticket = { id: `ticket-${tickets.length + 1}`, ...datosTicket };
  tickets.push(ticket);
  return ticket;
};
repositorioTickets.obtenerPorUsuario = async (userId) =>
  tickets
    .filter((ticket) => ticket.user === userId)
    .map((ticket) => ({
      ...ticket,
      event: {
        id: evento.id,
        title: evento.title,
        date: evento.date,
        location: 'Montevideo'
      }
    }));
repositorioTickets.obtenerPorEvento = async (eventId) =>
  tickets.filter((ticket) => ticket.event === eventId);

const cookiePara = (id = 'user-1', role = ROLES.USUARIO) => {
  const token = generarToken({ id, email: `${id}@mail.com`, role });
  return `currentUser=${token}`;
};

const inscribirse = (eventId, quantity, cookie) =>
  fetch(`${baseUrl}/api/events/${eventId}/tickets`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    body: JSON.stringify({ quantity })
  });

const obtener = (path, cookie) =>
  fetch(`${baseUrl}${path}`, { headers: cookie ? { cookie } : {} });

before(() => {
  server = aplicacion.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

beforeEach(() => {
  evento = {
    id: 'evento-1',
    title: 'Workshop Node',
    status: 'published',
    date: new Date(Date.now() + 86_400_000).toISOString(),
    capacity: 2,
    organizer: 'organizer-1'
  };
  tickets = [];
});

after(
  () =>
    new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    })
);

test('crear ticket requiere una sesión válida', async () => {
  const response = await inscribirse(evento.id, 1);
  assert.equal(response.status, 401);
});

test('crea una inscripción confirmada con referencias y código de reserva', async () => {
  const response = await inscribirse(evento.id, 1, cookiePara());
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.payload.user, 'user-1');
  assert.equal(body.payload.event, evento.id);
  assert.equal(body.payload.status, 'confirmed');
  assert.equal(body.payload.quantity, 1);
  assert.match(body.payload.reservationCode, /^[0-9a-f-]{36}$/i);
  assert.equal(body.payload.cancelledAt, null);
});

test('rechaza la inscripción a un evento inexistente', async () => {
  const response = await inscribirse('evento-inexistente', 1, cookiePara());
  assert.equal(response.status, 404);
  assert.equal((await response.json()).message, 'Evento no encontrado');
});

test('rechaza eventos cancelados, finalizados o con fecha pasada', async () => {
  for (const estado of ['cancelled', 'finished']) {
    evento.status = estado;
    const response = await inscribirse(evento.id, 1, cookiePara());
    assert.equal(response.status, 409);
  }

  evento.status = 'published';
  evento.date = new Date(Date.now() - 86_400_000).toISOString();
  const response = await inscribirse(evento.id, 1, cookiePara());
  assert.equal(response.status, 409);
});

test('rechaza cantidades inválidas y falta de cupo', async () => {
  for (const quantity of [0, -1, 1.5, '1']) {
    const response = await inscribirse(evento.id, quantity, cookiePara());
    assert.equal(response.status, 400);
  }

  tickets.push({ user: 'otro', event: evento.id, status: 'confirmed', quantity: 2 });
  const response = await inscribirse(evento.id, 1, cookiePara());
  assert.equal(response.status, 409);
  assert.equal((await response.json()).message, 'No hay cupos suficientes. Disponibles: 0');
});

test('rechaza una inscripción activa duplicada', async () => {
  tickets.push({ user: 'user-1', event: evento.id, status: 'pending', quantity: 1 });
  const response = await inscribirse(evento.id, 1, cookiePara());

  assert.equal(response.status, 409);
  assert.equal((await response.json()).message, 'Ya tenés una inscripción activa para este evento');
});

test('my-tickets requiere sesión y devuelve solo los tickets propios con datos del evento', async () => {
  tickets.push(
    { id: 'ticket-propio', user: 'user-1', event: evento.id, status: 'confirmed', quantity: 1 },
    { id: 'ticket-ajeno', user: 'user-2', event: evento.id, status: 'confirmed', quantity: 1 }
  );

  const sinSesion = await obtener('/api/tickets/my-tickets');
  assert.equal(sinSesion.status, 401);

  const response = await obtener('/api/tickets/my-tickets', cookiePara('user-1'));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.payload.length, 1);
  assert.equal(body.payload[0].id, 'ticket-propio');
  assert.deepEqual(Object.keys(body.payload[0].event).sort(), ['date', 'id', 'location', 'title']);
});

test('un user común no puede listar tickets de un evento', async () => {
  const response = await obtener(
    `/api/events/${evento.id}/tickets`,
    cookiePara('user-1', ROLES.USUARIO)
  );
  assert.equal(response.status, 403);
});

test('un organizer no puede listar tickets de un evento ajeno', async () => {
  const response = await obtener(
    `/api/events/${evento.id}/tickets`,
    cookiePara('organizer-2', ROLES.ORGANIZADOR)
  );
  assert.equal(response.status, 403);
});

test('el organizer propietario y admin pueden listar tickets del evento', async () => {
  tickets.push({
    id: 'ticket-1',
    user: 'user-1',
    event: evento.id,
    status: 'confirmed',
    quantity: 1
  });

  for (const [id, role] of [
    ['organizer-1', ROLES.ORGANIZADOR],
    ['admin-1', ROLES.ADMINISTRADOR]
  ]) {
    const response = await obtener(`/api/events/${evento.id}/tickets`, cookiePara(id, role));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.payload.length, 1);
    assert.equal(typeof body.payload[0].user, 'string');
  }
});
