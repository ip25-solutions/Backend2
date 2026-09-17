export const manejarErrores = (error, solicitud, respuesta, siguiente) => {
  if (error.name === 'ValidationError') {
    const detalles = Object.values(error.errors).map((detalle) => detalle.message);
    return respuesta.status(400).json({ status: 'error', message: 'Datos inválidos', detalles });
  }

  if (error.name === 'CastError') {
    return respuesta.status(400).json({ status: 'error', message: 'Identificador inválido' });
  }

  if (error.code === 11000) {
    return respuesta.status(409).json({ status: 'error', message: 'El recurso ya existe' });
  }

  const estado = error.estado || 500;
  const mensaje = estado === 500 ? 'Error interno del servidor' : error.message;
  return respuesta.status(estado).json({ status: 'error', message: mensaje });
};
