export class TicketsController {
  constructor(servicioTickets) {
    this.servicioTickets = servicioTickets;
    this.crear = this.crear.bind(this);
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
}
