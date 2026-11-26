import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  usuario: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'empleado'], default: 'empleado' },
}, { timestamps: true });

usuarioSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

usuarioSchema.methods.compararPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('Usuario', usuarioSchema);