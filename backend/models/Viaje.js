import mongoose from 'mongoose';

const camaroteSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['interior', 'exterior', 'balcon', 'suite'], required: true },
  precioPorPersona: { type: Number, required: true },
  capacidadPersonas: { type: Number, required: true }, // personas por camarote
  disponibles: { type: Number, required: true },       // camarotes libres
}, { _id: false });

const viajeSchema = new mongoose.Schema({
  destino: { type: String, required: true, trim: true },
  fechaSalida: { type: Date, required: true },
  duracionDias: { type: Number, required: true },
  camarotes: [camaroteSchema],
}, { timestamps: true });

export default mongoose.model('Viaje', viajeSchema);