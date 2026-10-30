import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { crearEventoDto } from '../src/dto/event.dto.js';
import { crearTicketDto } from '../src/dto/ticket.dto.js';
import { crearUsuarioDto } from '../src/dto/user.dto.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(raiz, 'src');

const listarJavaScript = async (directorio) => {
  const entradas = await readdir(directorio, { withFileTypes: true });
  const archivos = await Promise.all(
    entradas.map((entrada) => {
      const ruta = path.join(directorio, entrada.name);
      return entrada.isDirectory() ? listarJavaScript(ruta) : [ruta];
    })
  );

  return archivos.flat().filter((archivo) => archivo.endsWith('.js'));
};

test('los DTO normalizan identificadores y excluyen campos internos', () => {
  const usuario = crearUsuarioDto({
    _id: 'usuario-1',
    first_name: 'Ana',
    last_name: 'Pérez',
    email: 'ana@mail.com',
    role: 'user',
    password: 'hash-secreto',
    __v: 3
  });
  const evento = crearEventoDto({
    _id: 'evento-1',
    title: 'Congreso Tech',
    description: 'Tecnología',
    category: 'conference',
    date: '2030-10-20T18:00:00.000Z',
    location: 'Montevideo',
    capacity: 50,
    price: 100,
    status: 'published',
    organizer: { _id: 'organizer-1', password: 'otro-secreto' },
    __v: 2
  });
  const ticket = crearTicketDto({
    _id: 'ticket-1',
    user: { _id: 'usuario-1', email: 'ana@mail.com', password: 'hash-secreto' },
    event: {
      _id: 'evento-1',
      title: 'Congreso Tech',
      date: '2030-10-20T18:00:00.000Z',
      location: 'Montevideo'
    },
    quantity: 1,
    status: 'active',
    reservationCode: 'EVT-7QK2',
    cancelledAt: null,
    __v: 1
  });

  assert.deepEqual(usuario, {
    id: 'usuario-1',
    first_name: 'Ana',
    last_name: 'Pérez',
    email: 'ana@mail.com',
    role: 'user'
  });
  assert.equal(evento.id, 'evento-1');
  assert.equal(evento.organizer, 'organizer-1');
  assert.equal('_id' in evento, false);
  assert.equal('__v' in evento, false);
  assert.equal(ticket.id, 'ticket-1');
  assert.equal(ticket.user, 'usuario-1');
  assert.deepEqual(ticket.event, {
    id: 'evento-1',
    title: 'Congreso Tech',
    date: '2030-10-20T18:00:00.000Z',
    location: 'Montevideo'
  });
  assert.equal(JSON.stringify({ usuario, evento, ticket }).includes('password'), false);
});

test('los modelos de Mongoose solo se importan desde los DAO', async () => {
  const archivos = await listarJavaScript(src);
  const importadoresDeModelos = [];

  for (const archivo of archivos) {
    const contenido = await readFile(archivo, 'utf8');
    if (/from\s+['"]\.\.\/models\//.test(contenido)) {
      importadoresDeModelos.push(path.relative(src, archivo).replaceAll('\\', '/'));
    }
  }

  assert.deepEqual(importadoresDeModelos.sort(), [
    'dao/eventos.dao.js',
    'dao/tickets.dao.js',
    'dao/users.dao.js'
  ]);
});

test('controllers y services respetan los límites de las capas', async () => {
  const controllers = await listarJavaScript(path.join(src, 'controllers'));
  const services = await listarJavaScript(path.join(src, 'services'));

  for (const archivo of controllers) {
    const contenido = await readFile(archivo, 'utf8');
    assert.doesNotMatch(contenido, /from\s+['"].*\/(models|dao|repositories)\//);
  }

  for (const archivo of services) {
    const contenido = await readFile(archivo, 'utf8');
    assert.doesNotMatch(contenido, /from\s+['"].*\/(models|dao)\//);
  }
});

test('.env.example declara todas las variables requeridas', async () => {
  const ejemplo = await readFile(path.join(raiz, '.env.example'), 'utf8');
  const variables = [
    'PORT',
    'MONGO_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'NODE_ENV',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USER',
    'MAIL_PASS',
    'MAIL_FROM'
  ];

  for (const variable of variables) {
    assert.match(ejemplo, new RegExp(`^${variable}=`, 'm'));
  }
});
