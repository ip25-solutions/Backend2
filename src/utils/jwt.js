import jwt from 'jsonwebtoken';
import { entorno } from '../config/entorno.js';

const obtenerJwtSecret = () => {
  if (!entorno.jwtSecret) {
    throw new Error('La variable JWT_SECRET es obligatoria');
  }

  return entorno.jwtSecret;
};

export const generarToken = (payload) =>
  jwt.sign(payload, obtenerJwtSecret(), { expiresIn: entorno.jwtExpiresIn });
