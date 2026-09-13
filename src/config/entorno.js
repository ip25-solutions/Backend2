import dotenv from 'dotenv';

dotenv.config();

export const entorno = {
  puerto: Number(process.env.PORT) || 8080,
  entorno: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL || '',
  jwtSecret: process.env.JWT_SECRET || ''
};
