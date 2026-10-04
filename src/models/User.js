import mongoose from 'mongoose';
import { ROLES } from '../config/permisos.js';

const esquemaUsuario = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true
    },
    last_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USUARIO
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const User = mongoose.model('User', esquemaUsuario);
