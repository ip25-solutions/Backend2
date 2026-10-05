import mongoose from 'mongoose';
import { ESTADOS_TICKET } from '../config/tickets.js';

const esquemaTicket = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ESTADOS_TICKET),
      default: ESTADOS_TICKET.CONFIRMADO
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'La cantidad debe ser un número entero'
      }
    },
    reservationCode: {
      type: String,
      required: true,
      unique: true,
      immutable: true
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

esquemaTicket.index({ user: 1, event: 1, status: 1 });

export const Ticket = mongoose.model('Ticket', esquemaTicket);
