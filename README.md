# Plataforma de Eventos e Inscripciones

API REST para gestionar eventos e inscripciones. La base utiliza una arquitectura por capas y persistencia en MongoDB, preparada para incorporar autenticación, roles, cupos, tickets y notificaciones en entregas posteriores.

## Tecnologías

- Node.js
- Express
- dotenv
- MongoDB
- Mongoose
- JavaScript con módulos ESM

## Instalación

```bash
npm install
```

## Configuración

Copiá `.env.example` como `.env` y definí las variables necesarias:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/plataforma_eventos
JWT_SECRET=clave_secreta_de_desarrollo
```

## Ejecución

```bash
npm run dev
```

Para ejecución convencional:

```bash
npm start
```

El servidor establece la conexión con MongoDB antes de comenzar a recibir solicitudes.

## Estructura

```text
src/
├── app.js
├── server.js
├── config/          # Entorno y conexión con MongoDB
├── routes/          # Definición de endpoints
├── controllers/     # Entrada y salida HTTP
├── services/        # Reglas de negocio
├── repositories/    # Abstracción de acceso a datos
├── dao/             # Operaciones directas con Mongoose
├── models/          # Esquemas y modelos de MongoDB
├── middlewares/     # Manejo centralizado de solicitudes y errores
└── utils/           # Utilidades compartidas
```

El flujo de las operaciones es:

```text
Router → Controller → Service → Repository → DAO → Mongoose → MongoDB
```

## Rutas disponibles

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/api/health` | Confirma que el servidor está activo. |
| GET | `/api/events` | Devuelve todos los eventos. |
| GET | `/api/events/:id` | Devuelve un evento por su identificador. |
| POST | `/api/events` | Crea un evento. |
| PUT | `/api/events/:id` | Actualiza un evento. |
| DELETE | `/api/events/:id` | Elimina un evento. |
| GET | `/api/sessions` | Confirma que el módulo de sesiones está preparado. |

### Respuestas de ejemplo

`GET /api/health`

```json
{ "status": "ok", "message": "Servidor activo" }
```

`GET /api/events`

```json
{ "status": "success", "payload": [] }
```

### Cuerpo de un evento

```json
{
  "titulo": "Encuentro de tecnología",
  "descripcion": "Jornada sobre desarrollo de software",
  "fecha": "2026-10-20T18:00:00.000Z",
  "ubicacion": "Montevideo",
  "capacidad": 100
}
```
