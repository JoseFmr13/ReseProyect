import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true, trim: true },
  identificacion: { type: String, required: true, unique: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  domicilio: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model('Cliente', clienteSchema);