export class TicketsController {
  constructor(servicioTickets) {
    this.servicioTickets = servicioTickets;
    this.crear = this.crear.bind(this);
    this.listarPropios = this.listarPropios.bind(this);
    this.listarPorEvento = this.listarPorEvento.bind(this);
  }

  async crear(request, response, next) {
    try {
      const ticket = await this.servicioTickets.crear(
        request.params.eid,
        request.user,
        request.body.quantity
      );
      response.status(201).json({ status: 'success', payload: ticket });
    } catch (error) {
      next(error);
    }
  }

  async listarPropios(request, response, next) {
    try {
      const tickets = await this.servicioTickets.listarPropios(request.user.id);
      response.status(200).json({ status: 'success', payload: tickets });
    } catch (error) {
      next(error);
    }
  }

  async listarPorEvento(request, response, next) {
    try {
      const tickets = await this.servicioTickets.listarPorEvento(request.params.eid, request.user);
      response.status(200).json({ status: 'success', payload: tickets });
    } catch (error) {
      next(error);
    }
  }
}
