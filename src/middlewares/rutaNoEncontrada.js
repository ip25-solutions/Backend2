export const manejarRutaNoEncontrada = (solicitud, respuesta) => {
  respuesta.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
};
