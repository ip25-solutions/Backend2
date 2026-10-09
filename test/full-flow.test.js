import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

process.env.JWT_SECRET = 'clave_flujo_completo_para_pruebas';
process.env.JWT_EXPIRES_IN = '1h';

const { default: application } = await import('../src/app.js');
const {
  repositorioEventos,
  repositorioTickets,
  ticketsController,
  usersRepository
} = await import('../src/config/dependencias.js');

const users = new Map();
const events = new Map();
const tickets = new Map();
let server;
let baseUrl;

usersRepository.findByEmail = async (email) => users.get(email) ?? null;
usersRepository.findByEmailWithPassword = async (email) => users.get(email) ?? null;
usersRepository.create = async (data) => {
  const user = { _id: 'user-1', ...data, role: 'user' };
  users.set(user.email, user);
  return user;
};

repositorioEventos.create = async (data) => {
  const event = { _id: 'event-1', ...data };
  events.set(event._id, event);
  return event;
};
repositorioEventos.findById = async (id) => events.get(id) ?? null;
repositorioEventos.changeStatus = async (id, status) => {
  const event = events.get(id);
  if (!event) return null;
  const updatedEvent = { ...event, status };
  events.set(id, updatedEvent);
  return updatedEvent;
};

repositorioTickets.findActiveByUserAndEvent = async (userId, eventId) =>
  [...tickets.values()].find(
    (ticket) =>
      ticket.user === userId && ticket.event === eventId && ticket.status !== 'cancelled'
  ) ?? null;
repositorioTickets.countActiveTickets = async (eventId) =>
  [...tickets.values()]
    .filter((ticket) => ticket.event === eventId && ticket.status !== 'cancelled')
    .reduce((total, ticket) => total + ticket.quantity, 0);
repositorioTickets.create = async (data) => {
  const ticket = {
    _id: 'ticket-1',
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tickets.set(ticket._id, ticket);
  return ticket;
};
repositorioTickets.findByUser = async (userId) =>
  [...tickets.values()]
    .filter((ticket) => ticket.user === userId)
    .map((ticket) => ({ ...ticket, event: events.get(ticket.event) }));
repositorioTickets.findById = async (id) => tickets.get(id) ?? null;
repositorioTickets.cancelTicket = async (id, cancelledAt) => {
  const ticket = tickets.get(id);
  if (!ticket) return null;
  const cancelledTicket = { ...ticket, status: 'cancelled', cancelledAt };
  tickets.set(id, cancelledTicket);
  return cancelledTicket;
};

ticketsController.servicioTickets.servicioCorreo.enviarConfirmacionInscripcion = async () => ({
  accepted: ['organizer@mail.com']
});

const jsonRequest = (path, method, body, cookie) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });

before(() => {
  server = application.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(
  () =>
    new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    })
);

test('flujo completo desde el registro hasta la cancelación del ticket', async () => {
  const registerResponse = await jsonRequest('/api/sessions/register', 'POST', {
    first_name: 'Olivia',
    last_name: 'Organizer',
    email: 'organizer@mail.com',
    password: 'segura123'
  });
  assert.equal(registerResponse.status, 201);

  users.get('organizer@mail.com').role = 'organizer';

  const loginResponse = await jsonRequest('/api/sessions/login', 'POST', {
    email: 'organizer@mail.com',
    password: 'segura123'
  });
  assert.equal(loginResponse.status, 200);
  const cookie = loginResponse.headers.get('set-cookie').split(';', 1)[0];

  const createEventResponse = await jsonRequest(
    '/api/events',
    'POST',
    {
      title: 'Arquitectura Node',
      description: 'Capas profesionales para APIs',
      category: 'workshop',
      date: new Date(Date.now() + 86_400_000).toISOString(),
      location: 'Montevideo',
      capacity: 20,
      price: 0
    },
    cookie
  );
  assert.equal(createEventResponse.status, 201);

  const publishResponse = await jsonRequest(
    '/api/events/event-1/status',
    'PATCH',
    { status: 'published' },
    cookie
  );
  assert.equal(publishResponse.status, 200);

  const enrollmentResponse = await jsonRequest(
    '/api/events/event-1/tickets',
    'POST',
    { quantity: 2 },
    cookie
  );
  assert.equal(enrollmentResponse.status, 201);
  assert.equal((await enrollmentResponse.json()).payload.status, 'confirmed');

  const myTicketsResponse = await fetch(`${baseUrl}/api/tickets/my-tickets`, {
    headers: { cookie }
  });
  const myTicketsBody = await myTicketsResponse.json();
  assert.equal(myTicketsResponse.status, 200);
  assert.equal(myTicketsBody.payload.length, 1);
  assert.deepEqual(Object.keys(myTicketsBody.payload[0].event).sort(), [
    '_id',
    'date',
    'location',
    'title'
  ]);

  const cancelResponse = await jsonRequest(
    '/api/tickets/ticket-1/cancel',
    'PATCH',
    undefined,
    cookie
  );
  const cancelBody = await cancelResponse.json();
  assert.equal(cancelResponse.status, 200);
  assert.equal(cancelBody.payload.status, 'cancelled');
  assert.ok(cancelBody.payload.cancelledAt);
});
