# Plataforma de Eventos e Inscripciones

API REST para gestionar eventos e inscripciones. Esta tercera pre-entrega incorpora registro y login seguros, autenticación mediante JWT almacenado en una cookie HTTP Only y una ruta para consultar la sesión actual.

## Tecnologías

- Node.js y Express
- MongoDB y Mongoose
- bcrypt
- JSON Web Token
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

## Estructura

```text
src/
├── app.js
├── server.js
├── config/          # Entorno, conexión e inyección de dependencias
├── routes/          # Definición de endpoints
├── controllers/     # Entrada y salida HTTP
├── services/        # Validaciones y reglas de negocio
├── repositories/    # Abstracción de acceso a datos
├── dao/             # Operaciones directas con Mongoose
├── models/          # Esquemas y modelos de MongoDB
├── middlewares/     # Manejo centralizado de solicitudes y errores
└── utils/           # Hash con bcrypt y firma/verificación de JWT
```

El registro y el login respetan el siguiente flujo:

```text
Router → Controller → Service → Repository → DAO → Mongoose → MongoDB
```

La lógica de autenticación se distribuye de esta manera:

- `utils/hash.js`: hashea y compara contraseñas con bcrypt.
- `utils/jwt.js`: firma y verifica tokens usando las variables de entorno.
- `middlewares/auth.middleware.js`: valida la cookie y asigna el payload a `request.user`.
- `config/cookie.js`: centraliza el nombre y las opciones de la cookie.

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

Valida el email y la contraseña. Si son correctos, firma un JWT con `id`, `email` y `role`, y lo guarda en la cookie `currentUser`. La cookie utiliza `httpOnly`, `sameSite: 'lax'`, una duración de una hora y `secure` únicamente en producción.

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

Requiere una cookie válida y devuelve exclusivamente los datos incluidos en el JWT.

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
