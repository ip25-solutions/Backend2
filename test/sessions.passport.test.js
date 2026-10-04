import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

process.env.JWT_SECRET = 'clave_exclusiva_para_pruebas';
process.env.JWT_EXPIRES_IN = '2h';

const { default: aplicacion } = await import('../src/app.js');
const { usersRepository } = await import('../src/config/dependencias.js');

const users = new Map();
let nextId = 1;
let server;
let baseUrl;

usersRepository.findByEmail = async (email) => users.get(email) ?? null;
usersRepository.findByEmailWithPassword = async (email) => users.get(email) ?? null;
usersRepository.create = async (data) => {
  const id = String(nextId++);
  const user = {
    _id: { toString: () => id },
    ...data,
    role: 'user'
  };
  users.set(user.email, user);
  return user;
};

const request = (path, options = {}) => fetch(`${baseUrl}${path}`, options);

const jsonRequest = (path, body, options = {}) =>
  request(path, {
    method: 'POST',
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
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

test('registro, login, current y logout conservan el contrato de la API', async () => {
  const credentials = {
    first_name: 'Ana',
    last_name: 'Pérez',
    email: '  ANA@MAIL.COM ',
    password: 'segura123',
    role: 'admin'
  };

  const registerResponse = await jsonRequest('/api/sessions/register', credentials);
  const registerBody = await registerResponse.json();

  assert.equal(registerResponse.status, 201);
  assert.deepEqual(registerBody, {
    status: 'success',
    payload: {
      id: '1',
      first_name: 'Ana',
      last_name: 'Pérez',
      email: 'ana@mail.com',
      role: 'user'
    }
  });
  assert.equal('password' in registerBody.payload, false);

  const loginResponse = await jsonRequest('/api/sessions/login', {
    email: 'ANA@MAIL.COM',
    password: 'segura123'
  });
  const loginBody = await loginResponse.json();
  const setCookie = loginResponse.headers.get('set-cookie');
  const cookie = setCookie.split(';', 1)[0];

  assert.equal(loginResponse.status, 200);
  assert.deepEqual(loginBody, { status: 'success', message: 'Login correcto' });
  assert.match(setCookie, /currentUser=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Max-Age=7200/i);

  const currentResponse = await request('/api/sessions/current', {
    headers: { cookie }
  });
  assert.equal(currentResponse.status, 200);
  assert.deepEqual(await currentResponse.json(), {
    status: 'success',
    payload: { id: '1', email: 'ana@mail.com', role: 'user' }
  });

  const logoutResponse = await request('/api/sessions/logout', {
    method: 'POST',
    headers: { cookie }
  });
  const clearedCookie = logoutResponse.headers.get('set-cookie').split(';', 1)[0];

  assert.equal(logoutResponse.status, 200);
  assert.deepEqual(await logoutResponse.json(), {
    status: 'success',
    message: 'Sesión cerrada'
  });

  const currentAfterLogout = await request('/api/sessions/current', {
    headers: { cookie: clearedCookie }
  });
  assert.equal(currentAfterLogout.status, 401);
  assert.deepEqual(await currentAfterLogout.json(), {
    status: 'error',
    message: 'No autenticado'
  });
});

test('rechaza email duplicado y credenciales inválidas con los mensajes esperados', async () => {
  const duplicateResponse = await jsonRequest('/api/sessions/register', {
    first_name: 'Otra',
    last_name: 'Persona',
    email: 'ana@mail.com',
    password: 'otraClave123'
  });

  assert.equal(duplicateResponse.status, 409);
  assert.deepEqual(await duplicateResponse.json(), {
    status: 'error',
    message: 'El email ya está registrado'
  });

  const invalidLoginResponse = await jsonRequest('/api/sessions/login', {
    email: 'ana@mail.com',
    password: 'incorrecta'
  });

  assert.equal(invalidLoginResponse.status, 401);
  assert.deepEqual(await invalidLoginResponse.json(), {
    status: 'error',
    message: 'Credenciales inválidas'
  });

  const incompleteRegisterResponse = await jsonRequest('/api/sessions/register', {
    first_name: 'Sin',
    last_name: 'Clave',
    email: 'sin-clave@mail.com'
  });
  assert.equal(incompleteRegisterResponse.status, 400);
  assert.deepEqual(await incompleteRegisterResponse.json(), {
    status: 'error',
    message: 'Faltan campos obligatorios'
  });

  const incompleteLoginResponse = await jsonRequest('/api/sessions/login', {
    email: 'ana@mail.com'
  });
  assert.equal(incompleteLoginResponse.status, 401);
  assert.deepEqual(await incompleteLoginResponse.json(), {
    status: 'error',
    message: 'Credenciales inválidas'
  });
});

test('rechaza current sin cookie o con un token manipulado', async () => {
  const withoutCookieResponse = await request('/api/sessions/current');
  assert.equal(withoutCookieResponse.status, 401);
  assert.deepEqual(await withoutCookieResponse.json(), {
    status: 'error',
    message: 'No autenticado'
  });

  const manipulatedResponse = await request('/api/sessions/current', {
    headers: { cookie: 'currentUser=token.manipulado.invalido' }
  });
  assert.equal(manipulatedResponse.status, 401);
  assert.deepEqual(await manipulatedResponse.json(), {
    status: 'error',
    message: 'No autenticado'
  });
});
