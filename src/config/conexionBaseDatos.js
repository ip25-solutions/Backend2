import mongoose from 'mongoose';
import { entorno } from './entorno.js';

export const conectarBaseDatos = async () => {
  if (!entorno.mongoUrl) {
    throw new Error('La variable MONGO_URL es obligatoria');
  }

  await mongoose.connect(entorno.mongoUrl);
  console.log('Conexión a MongoDB establecida');
};
