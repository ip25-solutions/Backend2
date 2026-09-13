export const manejarErrores = (error, solicitud, respuesta, siguiente) => {
  respuesta.status(500).json({ status: 'error', message: 'Error interno del servidor' });
};
