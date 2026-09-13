export const consultarSesion = (solicitud, respuesta) => {
  respuesta.status(200).json({ status: 'success', message: 'Módulo de sesiones preparado' });
};
