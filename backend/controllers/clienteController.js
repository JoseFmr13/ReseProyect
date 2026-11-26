import Cliente from '../models/Cliente.js';

export const crearCliente = async (req, res) => {
  const existe = await Cliente.findOne({ identificacion: req.body.identificacion });
  if (existe) return res.status(409).json({ msg: 'Ya existe un cliente con esa identificación', cliente: existe });
  const cliente = await Cliente.create(req.body);
  res.status(201).json(cliente);
};

// API para la devolucion
  
export const listarClientes = async (req, res) => {
  const { q } = req.query;
  const filtro = q
    ? { $or: [
        { nombreCompleto: new RegExp(q, 'i') },
        { identificacion: new RegExp(q, 'i') },
      ] }
    : {};
  res.json(await Cliente.find(filtro).sort({ createdAt: -1 }).limit(50));
};

export const obtenerCliente = async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);
  if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' });
  res.json(cliente);
};

export const actualizarCliente = async (req, res) => {
  const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' });
  res.json(cliente);
};