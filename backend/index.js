import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import viajeRoutes from './routes/viajeRoutes.js';
import reservacionRoutes from './routes/reservacionRoutes.js';

dotenv.config();
conectarDB();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => res.send('API Reservaciones - Crucero'));
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/reservaciones', reservacionRoutes);

// Manejo de errores (Express 5 captura los errores de funciones async automáticamente)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.name === 'ValidationError' ? 400 : 500;
  res.status(status).json({ msg: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor funcionando en el puerto ${PORT}`));