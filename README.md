# Plataforma de Eventos e Inscripciones

API REST para gestionar eventos e inscripciones. Esta cuarta pre-entrega centraliza el registro, el login y la consulta de la sesión actual mediante estrategias de Passport.js, manteniendo JWT en una cookie HTTP Only y el mismo contrato HTTP de la etapa anterior.

## Tecnologías

- Node.js y Express
- MongoDB y Mongoose
- bcrypt
- JSON Web Token
- Passport.js, passport-local y passport-jwt
- cookie-parser
- dotenv
- JavaScript con módulos ESM

## Instalación

```bash
npm install
```

## Configuración

Copiá `.env.example` como `.env` y adaptá los valores a tu entorno:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://USUARIO:CONTRASENA@CLUSTER.mongodb.net/plataforma_eventos
JWT_SECRET=clave_secreta_de_desarrollo
JWT_EXPIRES_IN=1h
```

Reemplazá los marcadores de `MONGO_URL` por los datos de tu clúster de MongoDB Atlas y `JWT_SECRET` por un secreto robusto en el archivo `.env`. Este archivo está excluido del repositorio y nunca se deben guardar credenciales reales en `.env.example`.

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `PORT` | Puerto HTTP de la aplicación. | `8080` |
| `NODE_ENV` | Entorno de ejecución; en `production` activa cookies `secure`. | `development` |
| `MONGO_URL` | Cadena de conexión de MongoDB. | URI de MongoDB Atlas |
| `JWT_SECRET` | Secreto utilizado para firmar y validar los JWT. | Clave local sin datos reales |
| `JWT_EXPIRES_IN` | Vigencia compartida por el JWT y su cookie HTTP Only. | `1h` |

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Ejecución convencional:

```bash
npm start
```

El servidor se conecta a MongoDB antes de comenzar a recibir solicitudes.

Pruebas automatizadas:

```bash
npm test
```

Las pruebas ejecutan el flujo de sesiones con un repositorio simulado, por lo que no escriben datos en MongoDB.

## Estructura

```text
src/
├── app.js
├── server.js
├── config/          # Entorno, Passport, cookies, conexión y dependencias
├── routes/          # Definición de endpoints
├── controllers/     # Entrada y salida HTTP; JWT y cookie tras el login
├── services/        # Reglas de negocio de eventos
├── repositories/    # Abstracción de acceso a datos
├── dao/             # Operaciones directas con Mongoose
├── models/          # Esquemas y modelos de MongoDB
├── middlewares/     # Adaptación de Passport y manejo centralizado de errores
└── utils/           # Hash con bcrypt y firma de JWT
test/
└── sessions.passport.test.js
```

El registro y el login respetan el siguiente flujo:

```text
Router → Passport → Estrategia → Repository → DAO → Mongoose → MongoDB → Controller → Response
```

La lógica de autenticación se distribuye de esta manera:

- `config/passport.config.js`: centraliza las estrategias `register`, `login` y `current`.
- `app.js`: ejecuta una única configuración e inicializa Passport con `passport.initialize()`.
- `middlewares/passport.middleware.js`: adapta los fallos de Passport al contrato JSON de la API.
- `controllers/sessions.controller.js`: genera el JWT después del login y administra la cookie.
- `utils/hash.js`: hashea y compara contraseñas con bcrypt.
- `utils/jwt.js`: firma tokens usando las variables de entorno.
- `config/cookie.js`: centraliza el nombre y las opciones de la cookie.

## Estrategias de Passport

Todas las estrategias se registran en `src/config/passport.config.js`; `app.js` no contiene su implementación.

| Estrategia | Tipo | Responsabilidad |
| --- | --- | --- |
| `register` | Local | Valida los campos, normaliza el email, comprueba unicidad, hashea la contraseña y crea el usuario con el rol predeterminado. |
| `login` | Local | Normaliza el email, busca el hash y valida la contraseña con bcrypt sin revelar qué credencial falló. |
| `current` | JWT | Extrae el token de la cookie `currentUser`, valida firma y expiración, y asigna `{ id, email, role }` a `request.user`. |

Las estrategias solo autentican o registran al usuario. En particular, `login` no genera el JWT: esa responsabilidad permanece en el controller, que también configura la cookie HTTP Only. `logout` elimina la cookie directamente y no pasa por Passport.

La función `configurarPassport()` concentra el registro de estrategias. Para incorporar providers externos como Google o GitHub se agregan sus estrategias en ese archivo y sus rutas correspondientes, sin modificar la inicialización de `app.js`.

## Registro de usuarios

### `POST /api/sessions/register`

Campos obligatorios:

| Campo | Tipo | Condición |
| --- | --- | --- |
| `first_name` | string | No puede estar vacío. |
| `last_name` | string | No puede estar vacío. |
| `email` | string | Debe tener un formato válido. Se guarda con `trim` y en minúsculas. |
| `password` | string | Debe tener al menos 8 caracteres. Se guarda hasheada. |

El campo `role` no forma parte del registro público. Aunque se envíe en el body, se ignora y MongoDB asigna el valor predeterminado `user`. Los valores admitidos por el modelo son `user`, `organizer` y `admin`.

Ejemplo de solicitud:

```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Pérez","email":"Ana@Mail.com ","password":"Secreta123"}'
```

Respuesta exitosa (`201 Created`):

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a000000000000000000",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La respuesta nunca incluye `password`, ni en texto plano ni hasheada.

### Respuestas de error

Campos faltantes (`400 Bad Request`):

```json
{ "status": "error", "message": "Faltan campos obligatorios" }
```

Email inválido (`400 Bad Request`):

```json
{ "status": "error", "message": "El formato del email no es válido" }
```

Contraseña corta (`400 Bad Request`):

```json
{ "status": "error", "message": "La contraseña debe tener al menos 8 caracteres" }
```

Email repetido (`409 Conflict`):

```json
{ "status": "error", "message": "El email ya está registrado" }
```

## Inicio de sesión

### `POST /api/sessions/login`

La estrategia `login` valida el email y la contraseña. Si son correctos, el controller firma un JWT con `id`, `email` y `role`, y lo guarda en la cookie `currentUser`. La cookie utiliza `httpOnly`, `sameSite: 'lax'`, la duración configurada en `JWT_EXPIRES_IN` y `secure` únicamente en producción.

Solicitud:

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@mail.com","password":"Secreta123"}'
```

Respuesta exitosa (`200 OK`):

```json
{ "status": "success", "message": "Login correcto" }
```

El encabezado `Set-Cookie` contiene `currentUser`. Si el email no existe, falta algún campo o la contraseña es incorrecta, la respuesta no revela cuál fue el problema:

```json
{ "status": "error", "message": "Credenciales inválidas" }
```

## Usuario autenticado

### `GET /api/sessions/current`

Utiliza la estrategia `current`: requiere una cookie válida, deja el usuario autenticado en `request.user` y devuelve exclusivamente `id`, `email` y `role`.

Solicitud:

```bash
curl -b cookies.txt http://localhost:8080/api/sessions/current
```

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a000000000000000000",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Sin cookie, con un token manipulado o con un token expirado (`401 Unauthorized`):

```json
{ "status": "error", "message": "No autenticado" }
```

## Cierre de sesión

### `POST /api/sessions/logout`

Elimina la cookie de autenticación.

Solicitud:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/sessions/logout
```

Respuesta exitosa (`200 OK`):

```json
{ "status": "success", "message": "Sesión cerrada" }
```

## Comprobaciones antes de entregar

Ejecutá primero la suite automatizada:

```bash
npm test
```

1. Registrá un usuario y confirmá el código `201`.
2. Iniciá sesión y comprobá que la respuesta incluya la cookie `currentUser` con `HttpOnly`.
3. Consultá `/current` con la cookie y confirmá que devuelve `id`, `email` y `role`.
4. Cerrá la sesión y confirmá que una nueva consulta a `/current` devuelve `401`.
5. Probá el login con un email inexistente y con una contraseña incorrecta; ambos deben devolver el mismo mensaje.
6. Probá `/current` sin cookie, con un token manipulado y con un token expirado.
7. Confirmá que ninguna respuesta ni el JWT contienen el campo `password`.
8. En `mongosh`, inspeccioná el documento persistido:

```javascript
use plataforma_eventos
db.users.findOne({ email: 'ana@mail.com' })
```

El valor de `password` debe comenzar con el formato de hash de bcrypt y nunca coincidir con `Secreta123`.

## Resumen de rutas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Confirma que el servidor está activo. |
| POST | `/api/sessions/register` | Registra un usuario. |
| POST | `/api/sessions/login` | Valida credenciales y crea la cookie de autenticación. |
| GET | `/api/sessions/current` | Devuelve el usuario autenticado. Requiere una cookie válida. |
| POST | `/api/sessions/logout` | Elimina la cookie de autenticación. |
| GET | `/api/events` | Devuelve todos los eventos. |
| GET | `/api/events/:id` | Devuelve un evento por su identificador. |
| POST | `/api/events` | Crea un evento. |
| PUT | `/api/events/:id` | Actualiza un evento. |
| DELETE | `/api/events/:id` | Elimina un evento. |

## Ejemplos de las rutas generales

Estado del servidor:

```bash
curl http://localhost:8080/api/health
```

```json
{ "status": "ok", "message": "Servidor activo" }
```

Listar eventos:

```bash
curl http://localhost:8080/api/events
```

```json
{ "status": "success", "payload": [] }
```

Obtener un evento:

```bash
curl http://localhost:8080/api/events/665f2a000000000000000001
```

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a000000000000000001",
    "titulo": "Node.js para principiantes",
    "descripcion": "Introducción al desarrollo de APIs",
    "fecha": "2026-11-20T18:00:00.000Z",
    "ubicacion": "Montevideo",
    "capacidad": 50,
    "organizador": null
  }
}
```

Crear un evento:

```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Node.js para principiantes","descripcion":"Introducción al desarrollo de APIs","fecha":"2026-11-20T18:00:00.000Z","ubicacion":"Montevideo","capacidad":50}'
```

La respuesta utiliza el mismo objeto del ejemplo anterior y el código `201 Created`.

Actualizar un evento:

```bash
curl -X PUT http://localhost:8080/api/events/665f2a000000000000000001 \
  -H "Content-Type: application/json" \
  -d '{"capacidad":75}'
```

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a000000000000000001",
    "titulo": "Node.js para principiantes",
    "descripcion": "Introducción al desarrollo de APIs",
    "fecha": "2026-11-20T18:00:00.000Z",
    "ubicacion": "Montevideo",
    "capacidad": 75,
    "organizador": null
  }
}
```

Eliminar un evento:

```bash
curl -X DELETE http://localhost:8080/api/events/665f2a000000000000000001
```

```json
{ "status": "success", "message": "Evento eliminado" }
```
