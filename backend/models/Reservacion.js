import mongoose from 'mongoose';

const reservacionSchema = new mongoose.Schema({
  folio: { type: String, unique: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  viaje: { type: mongoose.Schema.Types.ObjectId, ref: 'Viaje', required: true },
  tipoCamarote: { type: String, required: true },
  numeroPasajeros: { type: Number, required: true, min: 1 },
  importe: { type: Number, required: true },
  notas: { type: String, default: '' },
  estado: { type: String, enum: ['confirmada', 'cancelada'], default: 'confirmada' },
  pago: {
    metodo: String,
    ultimos4: String,
    estado: { type: String, enum: ['aprobado', 'reembolsado'], default: 'aprobado' },
    referencia: String,
  },
  solicitud: {
    tipo: { type: String, enum: ['cancelacion', 'reembolso'] },
    motivo: String,
    estado: { type: String, enum: ['pendiente', 'aprobada', 'rechazada'] },
  },
  creadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
}, { timestamps: true });

export default mongoose.model('Reservacion', reservacionSchema);