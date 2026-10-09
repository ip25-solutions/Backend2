import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthenticatedUserDTO } from '../src/dto/authenticated-user.dto.js';
import { EventDTO } from '../src/dto/event.dto.js';
import { TicketDTO } from '../src/dto/ticket.dto.js';
import { UserDTO } from '../src/dto/user.dto.js';

const objectId = (value) => ({ toString: () => value });

test('los DTO de usuario nunca incluyen password', () => {
  const source = {
    _id: objectId('user-1'),
    first_name: 'Ana',
    last_name: 'Pérez',
    email: 'ana@mail.com',
    role: 'user',
    password: '$2b$hash'
  };

  assert.deepEqual(UserDTO.from(source), {
    id: 'user-1',
    first_name: 'Ana',
    last_name: 'Pérez',
    email: 'ana@mail.com',
    role: 'user'
  });
  assert.deepEqual(AuthenticatedUserDTO.from(source), {
    id: 'user-1',
    email: 'ana@mail.com',
    role: 'user'
  });
});

test('TicketDTO filtra documentos poblados y datos sensibles relacionados', () => {
  const result = TicketDTO.from({
    _id: objectId('ticket-1'),
    user: {
      _id: objectId('user-1'),
      email: 'ana@mail.com',
      password: '$2b$hash'
    },
    event: {
      _id: objectId('event-1'),
      title: 'Congreso Tech',
      date: '2030-10-20T18:00:00.000Z',
      location: 'Montevideo',
      description: 'No corresponde a esta respuesta',
      organizer: { password: '$2b$other-hash' }
    },
    status: 'confirmed',
    quantity: 1,
    reservationCode: 'ABC-123',
    createdAt: '2030-01-01T00:00:00.000Z',
    updatedAt: '2030-01-01T00:00:00.000Z',
    cancelledAt: null
  });

  assert.deepEqual(result, {
    _id: 'ticket-1',
    user: 'user-1',
    event: {
      _id: 'event-1',
      title: 'Congreso Tech',
      date: '2030-10-20T18:00:00.000Z',
      location: 'Montevideo'
    },
    status: 'confirmed',
    quantity: 1,
    reservationCode: 'ABC-123',
    createdAt: '2030-01-01T00:00:00.000Z',
    updatedAt: '2030-01-01T00:00:00.000Z',
    cancelledAt: null
  });
  assert.equal(JSON.stringify(result).includes('password'), false);
});

test('EventDTO expone únicamente el contrato público del evento', () => {
  const result = EventDTO.from({
    _id: objectId('event-1'),
    title: 'Congreso Tech',
    description: 'Arquitectura backend',
    category: 'conference',
    date: '2030-10-20T18:00:00.000Z',
    location: 'Montevideo',
    capacity: 100,
    price: 500,
    status: 'published',
    organizer: { _id: objectId('organizer-1'), password: '$2b$hash' },
    createdAt: '2030-01-01T00:00:00.000Z',
    updatedAt: '2030-01-02T00:00:00.000Z',
    internalNote: 'dato privado'
  });

  assert.equal(result.organizer, 'organizer-1');
  assert.equal('internalNote' in result, false);
  assert.equal(JSON.stringify(result).includes('password'), false);
});
