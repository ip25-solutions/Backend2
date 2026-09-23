export class SessionsController {
  constructor(sessionsService) {
    this.sessionsService = sessionsService;
    this.register = this.register.bind(this);
  }

  async register(request, response, next) {
    try {
      const user = await this.sessionsService.register(request.body);
      response.status(201).json({ status: 'success', payload: user });
    } catch (error) {
      next(error);
    }
  }
}
