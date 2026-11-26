import Viaje from '../models/Viaje.js';

export const listarViajes = async (req, res) => {
  const { destino, desde } = req.query;
  const filtro = { fechaSalida: { $gte: desde ? new Date(desde) : new Date() } };
  if (destino) filtro.destino = new RegExp(destino, 'i');
  res.json(await Viaje.find(filtro).sort({ fechaSalida: 1 }));
};

export const obtenerViaje = async (req, res) => {
  const viaje = await Viaje.findById(req.params.id);
  if (!viaje) return res.status(404).json({ msg: 'Viaje no encontrado' });
  res.json(viaje);
};