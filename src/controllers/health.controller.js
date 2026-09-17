export const obtenerEstadoServidor = (solicitud, respuesta) => {
  respuesta.status(200).json({ status: 'ok', message: 'Servidor activo' });
};
