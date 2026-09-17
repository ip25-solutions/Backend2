import mongoose from 'mongoose';

const esquemaUsuario = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellido: {
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
      required: true
    },
    rol: {
      type: String,
      enum: ['asistente', 'organizador', 'administrador'],
      default: 'asistente'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Usuario = mongoose.model('Usuario', esquemaUsuario);
