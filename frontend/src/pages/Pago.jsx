import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useReserva } from '../context/ReservaContext';
import { fecha, moneda, errorMsg } from '../utils/format';

export default function Pago() {
  const { cliente, seleccion, reiniciar } = useReserva();
  const navigate = useNavigate();
  const [tarjeta, setTarjeta] = useState('');
  const [resultado, setResultado] = useState(null); // { ok, reservacion } | { ok:false, msg }
  const [cargando, setCargando] = useState(false);

  if (!cliente || !seleccion) return <Navigate to="/reservacion/cliente" replace />;

  const { viaje, tipoCamarote, numeroPasajeros } = seleccion;
  const camarote = viaje.camarotes.find((c) => c.tipo === tipoCamarote);
  const importe = camarote.precioPorPersona * numeroPasajeros;

  const pagar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const { data } = await api.post('/reservaciones', {
        clienteId: cliente._id,
        viajeId: viaje._id,
        tipoCamarote,
        numeroPasajeros,
        pago: { metodo: 'tarjeta', numeroTarjeta: tarjeta },
      });
      setResultado({ ok: true, reservacion: data });
    } catch (err) {
      setResultado({ ok: false, msg: errorMsg(err) });
    }
    setCargando(false);
  };

  const terminar = () => { reiniciar(); navigate('/'); };

  return (
    <>
      <h2>Pago y confirmación</h2>
      <div className="tarjeta">
        <h3>Resumen de la reservación</h3>
        <p>Cliente: {cliente.nombreCompleto} ({cliente.identificacion})</p>
        <p>Destino: {viaje.destino} · Salida {fecha(viaje.fechaSalida)} · {viaje.duracionDias} días</p>
        <p>Camarote: {tipoCamarote} · Pasajeros: {numeroPasajeros}</p>
        <p>Importe a pagar: <strong>{moneda(importe)}</strong></p>
      </div>

      {!resultado?.ok && (
        <form className="tarjeta" onSubmit={pagar}>
          <h3>Pago con tarjeta (simulado)</h3>
          <label>Número de tarjeta</label>
          <input value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} placeholder="4111 1111 1111 1111" required />
          <small>Para probar un rechazo, usa una tarjeta que termine en 0000.</small>
          {resultado && !resultado.ok && <p className="error">❌ {resultado.msg}</p>}
          <br /><br />
          <button type="submit" disabled={cargando}>{cargando ? 'Procesando...' : 'Pagar'}</button>
        </form>
      )}

      {resultado?.ok && (
        <div className="tarjeta">
          <p className="exito">✅ Pago aprobado. Reservación confirmada.</p>
          <p>Folio: <strong>{resultado.reservacion.folio}</strong></p>
          <p>Referencia de pago: {resultado.reservacion.pago.referencia}</p>
          <button onClick={terminar}>Volver al panel</button>
        </div>
      )}
    </>
  );
}