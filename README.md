# Plataforma de Eventos e Inscripciones

API REST para gestionar eventos e inscripciones. Esta sexta pre-entrega completa la entidad Event con validaciones de negocio, autorización por propiedad, cancelación lógica y un listado público con filtros, paginación y ordenamiento.

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
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@CLUSTER.mongodb.net/plataforma_eventos
JWT_SECRET=clave_secreta_de_desarrollo
JWT_EXPIRES_IN=1h
```

Reemplazá los marcadores de `MONGO_URI` por los datos de tu clúster de MongoDB Atlas y `JWT_SECRET` por un secreto robusto en el archivo `.env`. Este archivo está excluido del repositorio y nunca se deben guardar credenciales reales en `.env.example`. Por compatibilidad, la aplicación también acepta la variable heredada `MONGO_URL`, pero `MONGO_URI` tiene prioridad.

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `PORT` | Puerto HTTP de la aplicación. | `8080` |
| `NODE_ENV` | Entorno de ejecución; en `production` activa cookies `secure`. | `development` |
| `MONGO_URI` | Cadena de conexión de MongoDB. | URI de MongoDB Atlas |
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

Las pruebas ejecutan los flujos de sesiones, eventos y administración con repositorios simulados, por lo que no escriben datos en MongoDB.

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
├── authorization.middleware.test.js
├── events.authorization.test.js
├── sessions.passport.test.js
└── users.authorization.test.js
```

El registro y el login respetan el siguiente flujo:

```text
Router → Passport → Estrategia → Repository → DAO → Mongoose → MongoDB → Controller → Response
```

La lógica de autenticación se distribuye de esta manera:

- `config/passport.config.js`: centraliza las estrategias `register`, `login` y `current`.
- `app.js`: ejecuta una única configuración e inicializa Passport con `passport.initialize()`.
- `middlewares/passport.middleware.js`: adapta los fallos de Passport al contrato JSON de la API.
- `middlewares/auth.middleware.js`: valida el JWT de la cookie y completa `request.user`.
- `middlewares/authorize.middleware.js`: compara el rol autenticado con los roles permitidos.
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

## Roles y autorización

El modelo admite los roles `user`, `organizer` y `admin`; el registro público siempre crea usuarios con el rol `user` e ignora cualquier `role` incluido en el body.

| Acción | user | organizer | admin |
| --- | :---: | :---: | :---: |
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar o cancelar eventos propios | ❌ | ✅ | ✅ |
| Modificar o cancelar cualquier evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

Las consultas de eventos son públicas. Las rutas privadas ejecutan primero `autenticar`, que valida la cookie y carga el usuario, y luego `autorizar`, que comprueba el rol. En las modificaciones existe además una validación de propiedad: un organizer solo puede operar sobre recursos cuyo campo `organizer` coincida con su identificador; un admin puede operar sobre cualquiera.

### Diferencia entre 401 y 403

- `401 Unauthorized`: no existe una cookie de sesión o el JWT es inválido o expiró. La respuesta es `{ "status": "error", "message": "No autenticado" }`.
- `403 Forbidden`: el JWT es válido, pero el rol o la propiedad del recurso no permiten la acción. La respuesta es `{ "status": "error", "message": "No tenés permisos para realizar esta acción" }`.

### Rutas protegidas

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/sessions/current` | Cualquier usuario autenticado |
| POST | `/api/events` | organizer o admin |
| PUT | `/api/events/:id` | organizer propietario o admin |
| PATCH | `/api/events/:id/status` | organizer propietario o admin |
| GET | `/api/users` | Solo admin |

## Colecciones y modelos

La aplicación persiste referencias entre documentos; no embebe el usuario completo dentro de Event.

| Colección | Campos principales |
| --- | --- |
| `users` | `first_name`, `last_name`, `email`, `password`, `role`, `createdAt`, `updatedAt` |
| `events` | `title`, `description`, `category`, `date`, `location`, `capacity`, `price`, `status`, `organizer`, `createdAt`, `updatedAt` |

`User.role` admite `user`, `organizer` y `admin`. `Event.organizer` es un ObjectId con referencia a `User`; nunca contiene un objeto de usuario embebido.

## Entidad Event

| Campo | Tipo | Regla |
| --- | --- | --- |
| `title` | string | Obligatorio y no vacío |
| `description` | string | Obligatorio y no vacío |
| `category` | string | Obligatorio y no vacío |
| `date` | date | Obligatorio y futuro al crear |
| `location` | string | Obligatorio y no vacío |
| `capacity` | number | Obligatorio y mayor que cero |
| `price` | number | Obligatorio y mayor o igual que cero |
| `status` | string | `draft`, `published`, `cancelled` o `finished`; por defecto `draft` |
| `organizer` | ObjectId | Referencia obligatoria a User, asignada desde la sesión |

`organizer` nunca se toma del body. El service utiliza el identificador de `request.user`, por lo que un cliente no puede crear un evento en nombre de otro usuario.

### Reglas de negocio

- No se pueden crear eventos con fecha pasada, capacidad menor o igual que cero ni precio negativo.
- `organizer` y `status` no se modifican mediante `PUT`; el estado tiene su endpoint específico.
- Un organizer solo modifica o cancela eventos propios; un admin puede hacerlo sobre eventos de cualquier organizer.
- Un evento `cancelled` no admite nuevas modificaciones ni cambios de estado. Esta regla también se aplica a admin para preservar el historial de cancelación.
- Un evento `finished` o cuya fecha ya pasó no puede volver a `published`.
- Cancelar significa cambiar `status` a `cancelled`. No existe eliminación física de eventos.

## Listado de eventos

`GET /api/events` es público y siempre devuelve una respuesta paginada. Parámetros disponibles:

| Parámetro | Descripción |
| --- | --- |
| `status` | Filtra por uno de los cuatro estados admitidos |
| `category` | Coincidencia exacta de categoría |
| `location` | Coincidencia parcial, sin distinguir mayúsculas |
| `dateFrom` | Fecha mínima incluida |
| `dateTo` | Fecha máxima incluida |
| `page` | Página positiva; valor predeterminado `1` |
| `limit` | Resultados por página; predeterminado `10`, máximo `100` |
| `sort` | `date`, `price`, `title` o `capacity`; prefijo `-` para orden descendente |

Ejemplo:

```bash
curl "http://localhost:8080/api/events?status=published&category=workshop&page=2&limit=5&sort=date"
```

```json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

Este contrato usa deliberadamente la clave `data` y siempre incluye `page`, `limit`, `total` y `totalPages`, tal como exige la consigna. La paginación se implementa en el DAO mediante `skip`, `limit` y `countDocuments`; no depende de `mongoose-paginate-v2` ni utiliza su formato `docs`.

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

Utiliza el middleware `autenticar`: requiere una cookie válida, deja el usuario autenticado en `request.user` y devuelve exclusivamente `id`, `email` y `role`.

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

9. Intentá crear un evento con rol `user` y confirmá el código `403`.
10. Probá crear eventos con fecha pasada, `capacity: 0` y `price: -1`; deben devolver `400`.
11. Confirmá que un organizer modifica su evento, recibe `403` sobre uno ajeno y que admin modifica cualquiera.
12. Cancelá un evento con `PATCH /api/events/:id/status` y verificá que el documento siga almacenado.
13. Intentá modificar o cambiar el estado de un evento cancelado; debe devolver `400`.
14. Probá filtros, paginación y ordenamiento sobre `GET /api/events`.
15. Consultá un identificador de evento inexistente y confirmá el código `404`.

## Resumen de rutas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Confirma que el servidor está activo. |
| POST | `/api/sessions/register` | Registra un usuario. |
| POST | `/api/sessions/login` | Valida credenciales y crea la cookie de autenticación. |
| GET | `/api/sessions/current` | Devuelve el usuario autenticado. Requiere una cookie válida. |
| POST | `/api/sessions/logout` | Elimina la cookie de autenticación. |
| GET | `/api/events` | Lista eventos con filtros, paginación y ordenamiento. Acceso público. |
| GET | `/api/events/:id` | Devuelve un evento por su identificador. |
| POST | `/api/events` | Crea un evento. Requiere organizer o admin. |
| PUT | `/api/events/:id` | Actualiza un evento propio o cualquiera si es admin. |
| PATCH | `/api/events/:id/status` | Cambia el estado de un evento propio o cualquiera si es admin. |
| GET | `/api/users` | Lista usuarios. Requiere rol `admin`. |

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
curl "http://localhost:8080/api/events?status=published&location=Montevideo&page=1&limit=10&sort=date"
```

```json
{
  "status": "success",
  "data": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
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
    "title": "Node.js para principiantes",
    "description": "Introducción al desarrollo de APIs",
    "category": "workshop",
    "date": "2030-11-20T18:00:00.000Z",
    "location": "Montevideo",
    "capacity": 50,
    "price": 1200,
    "status": "draft",
    "organizer": "665f2a000000000000000000"
  }
}
```

Crear un evento:

```bash
curl -X POST http://localhost:8080/api/events \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Node.js para principiantes","description":"Introducción al desarrollo de APIs","category":"workshop","date":"2030-11-20T18:00:00.000Z","location":"Montevideo","capacity":50,"price":1200}'
```

La respuesta utiliza el mismo objeto del ejemplo anterior, asigna `status: "draft"` y toma `organizer` de la sesión. El código es `201 Created`.

Actualizar un evento:

```bash
curl -X PUT http://localhost:8080/api/events/665f2a000000000000000001 \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"capacity":75,"price":1500}'
```

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a000000000000000001",
    "title": "Node.js para principiantes",
    "description": "Introducción al desarrollo de APIs",
    "category": "workshop",
    "date": "2030-11-20T18:00:00.000Z",
    "location": "Montevideo",
    "capacity": 75,
    "price": 1500,
    "status": "draft",
    "organizer": "665f2a000000000000000000"
  }
}
```

Cancelar un evento sin eliminarlo:

```bash
curl -X PATCH http://localhost:8080/api/events/665f2a000000000000000001/status \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled"}'
```

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a000000000000000001",
    "status": "cancelled"
  }
}
```

No se expone `DELETE /api/events/:id`: cancelar es una transición de negocio y debe conservar el documento para mantener su historial. Por eso se usa `PATCH` con el body `{ "status": "cancelled" }`.

## Pruebas manuales por rol

La autenticación utiliza un JWT dentro de la cookie HTTP Only `currentUser`. Los siguientes ejemplos guardan esa cookie con `-c` y la reutilizan con `-b`; no es necesario copiar el token manualmente. Se asume que existen cuentas de prueba con cada rol, ya que el registro público siempre crea usuarios `user`.

Login como user:

```bash
curl -i -c cookies-user.txt -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mail.com","password":"Secreta123"}'
```

Un user autenticado recibe `403` al intentar crear un evento:

```bash
curl -i -X POST http://localhost:8080/api/events \
  -b cookies-user.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Evento restringido","description":"Prueba de permisos","category":"workshop","date":"2030-11-20T18:00:00.000Z","location":"Montevideo","capacity":20,"price":0}'
```

Login y creación como organizer:

```bash
curl -i -c cookies-organizer.txt -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@mail.com","password":"Secreta123"}'

curl -i -X POST http://localhost:8080/api/events \
  -b cookies-organizer.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Workshop Node","description":"APIs con Express","category":"workshop","date":"2030-11-20T18:00:00.000Z","location":"Montevideo","capacity":30,"price":1200}'
```

El organizer puede modificar el evento creado por su cuenta, pero recibe `403` sobre eventos ajenos. Un admin puede modificar cualquier evento:

```bash
curl -i -c cookies-admin.txt -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mail.com","password":"Secreta123"}'

curl -i -X PUT http://localhost:8080/api/events/665f2a000000000000000001 \
  -b cookies-admin.txt \
  -H "Content-Type: application/json" \
  -d '{"capacity":50}'
```

Sin ninguna cookie, las rutas privadas responden `401`; con una cookie válida pero permisos insuficientes responden `403`.
