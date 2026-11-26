import Reservacion from '../models/Reservacion.js';
import Viaje from '../models/Viaje.js';
import mongoose from 'mongoose';


const populateOpts = [
  { path: 'cliente', select: 'nombreCompleto identificacion email telefono' },
  { path: 'viaje', select: 'destino fechaSalida duracionDias' },
];

export const crearReservacion = async (req, res) => {
  const { clienteId, viajeId, tipoCamarote, numeroPasajeros, pago } = req.body;

  const viaje = await Viaje.findById(viajeId);
  if (!viaje) return res.status(404).json({ msg: 'Viaje no encontrado' });

  const camarote = viaje.camarotes.find((c) => c.tipo === tipoCamarote);
  if (!camarote) return res.status(400).json({ msg: 'Tipo de camarote inválido' });
  if (numeroPasajeros > camarote.capacidadPersonas) {
    return res.status(400).json({ msg: `Ese camarote admite máximo ${camarote.capacidadPersonas} pasajeros` });
  }

  const importe = camarote.precioPorPersona * numeroPasajeros;

  // Pago SIMULADO: se rechaza si la tarjeta termina en 0000 (para probar el caso de error)
  const numero = String(pago?.numeroTarjeta || '').replace(/\s/g, '');
  if (numero.length < 4) return res.status(400).json({ msg: 'Tarjeta inválida' });
  if (numero.endsWith('0000')) {
    return res.status(402).json({ msg: 'Pago rechazado', pago: { estado: 'rechazado' }, importe });
  }

  // Reserva el camarote de forma atómica (evita sobreventa)
  const upd = await Viaje.updateOne(
    { _id: viajeId, camarotes: { $elemMatch: { tipo: tipoCamarote, disponibles: { $gte: 1 } } } },
    { $inc: { 'camarotes.$.disponibles': -1 } }
  );
  if (upd.modifiedCount === 0) return res.status(409).json({ msg: 'Ya no hay camarotes disponibles de ese tipo' });

  const reservacion = await Reservacion.create({
    folio: `RES-${Date.now().toString(36).toUpperCase()}`,
    cliente: clienteId,
    viaje: viajeId,
    tipoCamarote,
    numeroPasajeros,
    importe,
    pago: {
      metodo: pago.metodo || 'tarjeta',
      ultimos4: numero.slice(-4),     // nunca guardamos la tarjeta completa
      estado: 'aprobado',
      referencia: `PAY-${Date.now()}`,
    },
    creadaPor: req.usuario.id,
  });

  res.status(201).json(await reservacion.populate(populateOpts));
};

export const listarReservaciones = async (req, res) => {
  const { q, estado, solicitud } = req.query;
  const filtro = {};
  if (q) filtro.folio = new RegExp(q, 'i');
  if (estado) filtro.estado = estado;
  if (solicitud) filtro['solicitud.estado'] = solicitud; // ej. ?solicitud=pendiente
  res.json(await Reservacion.find(filtro).populate(populateOpts).sort({ createdAt: -1 }).limit(100));
};

export const obtenerReservacion = async (req, res) => {
  const r = await Reservacion.findById(req.params.id).populate(populateOpts);
  if (!r) return res.status(404).json({ msg: 'Reservación no encontrada' });
  res.json(r);
};

export const modificarReservacion = async (req, res) => {
  const r = await Reservacion.findById(req.params.id);
  if (!r) return res.status(404).json({ msg: 'Reservación no encontrada' });
  if (r.estado === 'cancelada') return res.status(400).json({ msg: 'No se puede modificar una reservación cancelada' });

  if (req.body.notas !== undefined) r.notas = req.body.notas;

  if (req.body.numeroPasajeros) {
    const viaje = await Viaje.findById(r.viaje);
    const cam = viaje.camarotes.find((c) => c.tipo === r.tipoCamarote);
    if (req.body.numeroPasajeros > cam.capacidadPersonas) {
      return res.status(400).json({ msg: `Máximo ${cam.capacidadPersonas} pasajeros en este camarote` });
    }
    r.numeroPasajeros = req.body.numeroPasajeros;
    r.importe = cam.precioPorPersona * r.numeroPasajeros;
  }

  await r.save();
  res.json(await r.populate(populateOpts));
};

// Empleado o admin: pide cancelación o reembolso
export const solicitarCancelacion = async (req, res) => {
  const { tipo, motivo } = req.body; // tipo: 'cancelacion' | 'reembolso'
  const r = await Reservacion.findById(req.params.id);
  if (!r) return res.status(404).json({ msg: 'Reservación no encontrada' });
  if (r.estado === 'cancelada') return res.status(400).json({ msg: 'La reservación ya está cancelada' });
  if (r.solicitud?.estado === 'pendiente') return res.status(409).json({ msg: 'Ya hay una solicitud pendiente' });

  r.solicitud = { tipo, motivo, estado: 'pendiente' };
  await r.save();
  res.json(await r.populate(populateOpts));
};

// Solo admin: aprueba o rechaza
export const resolverSolicitud = async (req, res) => {
  const { decision } = req.body; // 'aprobada' | 'rechazada'
  const r = await Reservacion.findById(req.params.id);
  if (!r || r.solicitud?.estado !== 'pendiente') {
    return res.status(400).json({ msg: 'No hay solicitud pendiente' });
  }

  r.solicitud.estado = decision;
  if (decision === 'aprobada') {
    r.estado = 'cancelada';
    if (r.solicitud.tipo === 'reembolso') r.pago.estado = 'reembolsado';
    // libera el camarote
    await Viaje.updateOne(
      { _id: r.viaje, 'camarotes.tipo': r.tipoCamarote },
      { $inc: { 'camarotes.$.disponibles': 1 } }
    );
  }
  await r.save();
  res.json(await r.populate(populateOpts));
};


export const resumen = async (req, res) => {
  const esAdmin = req.usuario.rol === 'admin';
  // El empleado solo ve lo que él creó; el admin ve todo
  const base = esAdmin ? {} : { creadaPor: new mongoose.Types.ObjectId(req.usuario.id) };

  const [confirmadas, canceladas, solicitudesPendientes, ingresos, recientes, pendientes, proximosViajes] =
    await Promise.all([
      Reservacion.countDocuments({ ...base, estado: 'confirmada' }),
      Reservacion.countDocuments({ ...base, estado: 'cancelada' }),
      Reservacion.countDocuments({ ...base, 'solicitud.estado': 'pendiente' }),
      Reservacion.aggregate([
        { $match: { ...base, estado: 'confirmada' } },
        { $group: { _id: null, total: { $sum: '$importe' } } },
      ]),
      Reservacion.find(base).populate(populateOpts).sort({ createdAt: -1 }).limit(6),
      Reservacion.find({ ...base, 'solicitud.estado': 'pendiente' })
        .populate(populateOpts).sort({ updatedAt: -1 }).limit(5),
      Viaje.find({ fechaSalida: { $gte: new Date() } }).sort({ fechaSalida: 1 }).limit(4),
    ]);

  res.json({
    confirmadas,
    canceladas,
    solicitudesPendientes,
    ingresos: ingresos[0]?.total || 0,
    recientes,
    pendientes,
    proximosViajes,
  });
};