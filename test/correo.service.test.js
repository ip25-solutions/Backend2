import assert from 'node:assert/strict';
import test from 'node:test';
import { ServicioCorreo } from '../src/services/correo.service.js';

const configuracion = {
  mailHost: 'smtp.example.com',
  mailPort: 587,
  mailUser: 'usuario',
  mailPass: 'secreto',
  mailFrom: 'Eventos <eventos@example.com>'
};

test('el email de cancelación informa evento, cantidad y código de reserva', async () => {
  const servicioCorreo = new ServicioCorreo(configuracion);
  let mensaje;

  servicioCorreo.obtenerTransportador = () => ({
    sendMail: async (datos) => {
      mensaje = datos;
      return { accepted: [datos.to] };
    }
  });

  const resultado = await servicioCorreo.enviarCancelacionInscripcion({
    destinatario: 'asistente@mail.com',
    ticket: { quantity: 2, reservationCode: 'RESERVA-123' },
    evento: {
      title: 'Workshop Node',
      date: '2030-11-20T18:00:00.000Z',
      location: 'Montevideo'
    }
  });

  assert.deepEqual(resultado, { accepted: ['asistente@mail.com'] });
  assert.equal(mensaje.from, configuracion.mailFrom);
  assert.equal(mensaje.to, 'asistente@mail.com');
  assert.equal(mensaje.subject, 'Inscripción cancelada: Workshop Node');
  assert.match(mensaje.text, /Cantidad liberada: 2/u);
  assert.match(mensaje.text, /Código de reserva: RESERVA-123/u);
});
