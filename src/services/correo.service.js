import nodemailer from 'nodemailer';

export class ServicioCorreo {
  constructor(configuracion) {
    this.configuracion = configuracion;
    this.transportador = null;
  }

  obtenerTransportador() {
    const { mailHost, mailPort, mailUser, mailPass, mailFrom } = this.configuracion;

    if (!mailHost || !mailPort || !mailUser || !mailPass || !mailFrom) {
      throw new Error('Las variables de entorno MAIL_* son obligatorias para enviar emails');
    }

    if (!this.transportador) {
      this.transportador = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailPort === 465,
        auth: { user: mailUser, pass: mailPass }
      });
    }

    return this.transportador;
  }

  async enviarConfirmacionInscripcion({ destinatario, ticket, evento }) {
    const fecha = new Date(evento.date).toLocaleString('es-UY');

    return this.obtenerTransportador().sendMail({
      from: this.configuracion.mailFrom,
      to: destinatario,
      subject: `Inscripción confirmada: ${evento.title}`,
      text: [
        `Tu inscripción a ${evento.title} fue confirmada.`,
        `Fecha: ${fecha}`,
        `Lugar: ${evento.location}`,
        `Cantidad: ${ticket.quantity}`,
        `Código de reserva: ${ticket.reservationCode}`
      ].join('\n')
    });
  }

  async enviarCancelacionInscripcion({ destinatario, ticket, evento }) {
    const fecha = new Date(evento.date).toLocaleString('es-UY');

    return this.obtenerTransportador().sendMail({
      from: this.configuracion.mailFrom,
      to: destinatario,
      subject: `Inscripción cancelada: ${evento.title}`,
      text: [
        `Tu inscripción a ${evento.title} fue cancelada.`,
        `Fecha del evento: ${fecha}`,
        `Lugar: ${evento.location}`,
        `Cantidad liberada: ${ticket.quantity}`,
        `Código de reserva: ${ticket.reservationCode}`
      ].join('\n')
    });
  }
}
