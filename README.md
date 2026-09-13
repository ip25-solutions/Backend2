# Plataforma de Eventos e Inscripciones

API REST inicial para gestionar eventos e inscripciones. Esta primera etapa define una arquitectura escalable para incorporar autenticación, roles, cupos, tickets y notificaciones en entregas posteriores.

## Tecnologías

- Node.js
- Express
- dotenv
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

## Estructura

```text
src/
├── app.js
├── server.js
├── config/
├── routes/
├── controllers/
├── services/
├── repositories/
├── dao/
├── models/
├── middlewares/
└── utils/
```

## Rutas disponibles

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/api/health` | Confirma que el servidor está activo. |
| GET | `/api/events` | Devuelve la lista inicial vacía de eventos. |
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
