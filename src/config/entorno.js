import dotenv from 'dotenv';

dotenv.config();

export const entorno = {
  puerto: Number(process.env.PORT) || 8080,
  ambiente: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  mailHost: process.env.MAIL_HOST || '',
  mailPort: Number(process.env.MAIL_PORT) || 0,
  mailUser: process.env.MAIL_USER || '',
  mailPass: process.env.MAIL_PASS || '',
  mailFrom: process.env.MAIL_FROM || ''
};
