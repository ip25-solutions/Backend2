import { ErrorAplicacion } from '../utils/ErrorAplicacion.js';
import { ESTADOS_EVENTO } from '../config/eventos.js';
import { ROLES } from '../config/permisos.js';

const camposDeTextoObligatorios = ['title', 'description', 'category', 'location'];
const estadosValidos = new Set(Object.values(ESTADOS_EVENTO));
const camposOrdenables = new Set(['date', 'price', 'title', 'capacity']);
const LIMITE_PREDETERMINADO = 10;
const LIMITE_MAXIMO = 100;

const escaparExpresionRegular = (valor) => valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const convertirEnteroPositivo = (valor, nombre, valorPredeterminado, maximo) => {
  if (valor === undefined) {
    return valorPredeterminado;
  }

  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0 || (maximo && numero > maximo)) {
    throw new ErrorAplicacion(`El parámetro ${nombre} no es válido`, 400);
  }

  return numero;
};

const convertirFecha = (valor, nombre) => {
  if (valor === undefined) return undefined;

  if (typeof valor !== 'string') {
    throw new ErrorAplicacion(`El parámetro ${nombre} no es una fecha válida`, 400);
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorAplicacion(`El parámetro ${nombre} no es una fecha válida`, 400);
  }

  return fecha;
};

const prepararListado = (query) => {
  const page = convertirEnteroPositivo(query.page, 'page', 1);
  const limit = convertirEnteroPositivo(query.limit, 'limit', LIMITE_PREDETERMINADO, LIMITE_MAXIMO);
  const filtros = {};

  if (query.status !== undefined) {
    if (typeof query.status !== 'string' || !estadosValidos.has(query.status)) {
      throw new ErrorAplicacion('El filtro status no es válido', 400);
    }
    filtros.status = query.status;
  }

  if (query.category !== undefined && typeof query.category !== 'string') {
    throw new ErrorAplicacion('El filtro category no es válido', 400);
  }

  if (query.category) {
    filtros.category = query.category.trim();
  }

  if (query.location !== undefined && typeof query.location !== 'string') {
    throw new ErrorAplicacion('El filtro location no es válido', 400);
  }

  if (query.location) {
    filtros.location = {
      $regex: escaparExpresionRegular(query.location.trim()),
      $options: 'i'
    };
  }

  const dateFrom = convertirFecha(query.dateFrom, 'dateFrom');
  const dateTo = convertirFecha(query.dateTo, 'dateTo');

  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new ErrorAplicacion('dateFrom no puede ser posterior a dateTo', 400);
  }

  if (dateFrom || dateTo) {
    filtros.date = {};
    if (dateFrom) filtros.date.$gte = dateFrom;
    if (dateTo) filtros.date.$lte = dateTo;
  }

  const sort = query.sort ?? 'date';

  if (typeof sort !== 'string') {
    throw new ErrorAplicacion('El parámetro sort no es válido', 400);
  }

  const descendente = sort.startsWith('-');
  const campoOrden = descendente ? sort.slice(1) : sort;

  if (!camposOrdenables.has(campoOrden)) {
    throw new ErrorAplicacion('El parámetro sort no es válido', 400);
  }

  return {
    filtros,
    orden: { [campoOrden]: descendente ? -1 : 1 },
    page,
    limit
  };
};

const validarCreacion = (datosEvento) => {
  const faltanCamposDeTexto = camposDeTextoObligatorios.some(
    (campo) => typeof datosEvento[campo] !== 'string' || !datosEvento[campo].trim()
  );

  if (faltanCamposDeTexto || datosEvento.date === undefined) {
    throw new ErrorAplicacion('Faltan campos obligatorios del evento', 400);
  }

  const date = new Date(datosEvento.date);

  if (Number.isNaN(date.getTime())) {
    throw new ErrorAplicacion('La fecha del evento no es válida', 400);
  }

  if (date <= new Date()) {
    throw new ErrorAplicacion('La fecha del evento debe ser futura', 400);
  }

  if (!Number.isFinite(datosEvento.capacity) || datosEvento.capacity <= 0) {
    throw new ErrorAplicacion('La capacidad debe ser mayor que cero', 400);
  }

  if (!Number.isFinite(datosEvento.price) || datosEvento.price < 0) {
    throw new ErrorAplicacion('El precio no puede ser negativo', 400);
  }

  if (datosEvento.status !== undefined && !estadosValidos.has(datosEvento.status)) {
    throw new ErrorAplicacion('El estado del evento no es válido', 400);
  }
};

const validarPropiedad = (evento, usuario) => {
  if (usuario.role === ROLES.ADMINISTRADOR) {
    return;
  }

  if (evento.organizer?.toString() !== usuario.id) {
    throw new ErrorAplicacion('No tenés permisos para realizar esta acción', 403);
  }
};

export class ServicioEventos {
  constructor(repositorioEventos) {
    this.repositorioEventos = repositorioEventos;
  }

  async listar(query = {}) {
    const opciones = prepararListado(query);
    const { data, total } = await this.repositorioEventos.obtenerTodos(opciones);

    return {
      data,
      page: opciones.page,
      limit: opciones.limit,
      total,
      totalPages: Math.ceil(total / opciones.limit)
    };
  }

  async obtenerPorId(id) {
    const evento = await this.repositorioEventos.obtenerPorId(id);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    return evento;
  }

  async crear(datosEvento, organizerId) {
    validarCreacion(datosEvento);
    const { organizer: _organizerIgnorado, ...datosPermitidos } = datosEvento;

    return this.repositorioEventos.crear({
      ...datosPermitidos,
      status: datosPermitidos.status ?? ESTADOS_EVENTO.BORRADOR,
      organizer: organizerId
    });
  }

  async actualizar(id, datosEvento, usuario) {
    const eventoExistente = await this.obtenerPorId(id);
    validarPropiedad(eventoExistente, usuario);

    const evento = await this.repositorioEventos.actualizar(id, datosEvento);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    return evento;
  }

  async eliminar(id, usuario) {
    const eventoExistente = await this.obtenerPorId(id);
    validarPropiedad(eventoExistente, usuario);

    const evento = await this.repositorioEventos.eliminar(id);

    if (!evento) {
      throw new ErrorAplicacion('Evento no encontrado', 404);
    }

    return evento;
  }
}
