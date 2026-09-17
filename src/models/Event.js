import mongoose from 'mongoose';

const esquemaEvento = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      required: true,
      trim: true
    },
    fecha: {
      type: Date,
      required: true
    },
    ubicacion: {
      type: String,
      required: true,
      trim: true
    },
    capacidad: {
      type: Number,
      required: true,
      min: 1
    },
    organizador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Evento = mongoose.model('Evento', esquemaEvento);
