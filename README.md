# Plataforma de Eventos e Inscripciones

API REST para gestionar eventos e inscripciones. Esta segunda pre-entrega incorpora el registro seguro de usuarios mediante una arquitectura por capas, persistencia con MongoDB y contraseñas protegidas con bcrypt.

## Tecnologías

- Node.js y Express
- MongoDB y Mongoose
- bcrypt
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
MONGO_URL=mongodb://localhost:27017/plataforma_eventos
JWT_SECRET=clave_secreta_de_desarrollo
```

El archivo `.env` está excluido del repositorio. No se deben guardar credenciales reales en `.env.example`.

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
└── utils/           # Utilidades reutilizables, incluido el hash con bcrypt
```

El registro recorre el siguiente flujo:

```text
Router → Controller → Service → Repository → DAO → Mongoose → MongoDB
```

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

## Comprobaciones antes de entregar

1. Registrá un usuario con el ejemplo anterior y confirmá el código `201`.
2. Repetí la solicitud con el mismo email, incluso cambiando mayúsculas o espacios, y confirmá el código `409`.
3. Probá omitir un campo, usar un email inválido y enviar una contraseña de menos de 8 caracteres.
4. Confirmá que el JSON de respuesta no contiene el campo `password`.
5. En `mongosh`, inspeccioná el documento persistido:

```javascript
use plataforma_eventos
db.users.findOne({ email: 'ana@mail.com' })
```

El valor de `password` debe comenzar con el formato de hash de bcrypt y nunca coincidir con `Secreta123`.

## Otras rutas disponibles

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Confirma que el servidor está activo. |
| GET | `/api/events` | Devuelve todos los eventos. |
| GET | `/api/events/:id` | Devuelve un evento por su identificador. |
| POST | `/api/events` | Crea un evento. |
| PUT | `/api/events/:id` | Actualiza un evento. |
| DELETE | `/api/events/:id` | Elimina un evento. |
