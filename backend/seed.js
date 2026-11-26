import 'dotenv/config';
import mongoose from 'mongoose';
import conectarDB from './config/db.js';
import Usuario from './models/Usuario.js';
import Viaje from './models/Viaje.js';

await conectarDB();

await Usuario.deleteMany();
await Viaje.deleteMany();

await Usuario.create([
  { nombre: 'Administrador', usuario: 'admin', password: 'admin123', rol: 'admin' },
  { nombre: 'Empleado Demo', usuario: 'empleado', password: 'empleado123', rol: 'empleado' },
]);

const camarotes = (mult = 1) => [
  { tipo: 'interior', precioPorPersona: 12000 * mult, capacidadPersonas: 4, disponibles: 20 },
  { tipo: 'exterior', precioPorPersona: 16000 * mult, capacidadPersonas: 4, disponibles: 15 },
  { tipo: 'balcon',   precioPorPersona: 22000 * mult, capacidadPersonas: 3, disponibles: 10 },
  { tipo: 'suite',    precioPorPersona: 40000 * mult, capacidadPersonas: 2, disponibles: 5 },
];

const dias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

await Viaje.create([
  { destino: 'Caribe', fechaSalida: dias(30), duracionDias: 7, camarotes: camarotes(1) },
  { destino: 'Alaska', fechaSalida: dias(45), duracionDias: 10, camarotes: camarotes(1.4) },
  { destino: 'Mediterráneo', fechaSalida: dias(60), duracionDias: 14, camarotes: camarotes(1.8) },
  { destino: 'Pacífico Mexicano', fechaSalida: dias(20), duracionDias: 5, camarotes: camarotes(0.7) },
]);

console.log('Datos de prueba creados');
await mongoose.disconnect();