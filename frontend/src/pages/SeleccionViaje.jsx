import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useReserva } from '../context/ReservaContext';
import { fecha, moneda } from '../utils/format';

export default function SeleccionViaje() {
  const { cliente, setSeleccion } = useReserva();
  const navigate = useNavigate();
  const [viajes, setViajes] = useState([]);
  const [destino, setDestino] = useState('');
  const [viaje, setViaje] = useState(null);
  const [tipo, setTipo] = useState('');
  const [pasajeros, setPasajeros] = useState(1);

  const cargar = async () => {
    const { data } = await api.get('/viajes', { params: { destino } });
    setViajes(data);
  };

  useEffect(() => { cargar(); }, []);

  if (!cliente) return <Navigate to="/reservacion/cliente" replace />;

  const camarote = viaje?.camarotes.find((c) => c.tipo === tipo);
  const total = camarote ? camarote.precioPorPersona * pasajeros : 0;
  const valido = camarote && camarote.disponibles > 0 && pasajeros >= 1 && pasajeros <= camarote.capacidadPersonas;

  const continuar = () => {
    setSeleccion({ viaje, tipoCamarote: tipo, numeroPasajeros: Number(pasajeros) });
    navigate('/reservacion/pago');
  };

  return (
    <>
      <h2>Selección de viaje y camarote</h2>
      <p>Cliente: <strong>{cliente.nombreCompleto}</strong></p>

      <div className="fila tarjeta">
        <input placeholder="Filtrar por destino" value={destino} onChange={(e) => setDestino(e.target.value)} />
        <button onClick={cargar}>Buscar</button>
      </div>

      {viajes.map((v) => (
        <div
          key={v._id}
          className={`opcion-viaje ${viaje?._id === v._id ? 'activa' : ''}`}
          onClick={() => { setViaje(v); setTipo(''); }}
        >
          <strong>{v.destino}</strong> · Salida: {fecha(v.fechaSalida)} · Duración: {v.duracionDias} días
        </div>
      ))}

      {viaje && (
        <div className="tarjeta">
          <label>Tipo de camarote</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {viaje.camarotes.map((c) => (
              <option key={c.tipo} value={c.tipo} disabled={c.disponibles === 0}>
                {c.tipo} · {moneda(c.precioPorPersona)} por persona · {c.disponibles} disponibles
              </option>
            ))}
          </select>

          <label>Número de pasajeros {camarote && `(máx. ${camarote.capacidadPersonas})`}</label>
          <input type="number" min="1" value={pasajeros} onChange={(e) => setPasajeros(e.target.value)} />

          {camarote && <p>Total estimado: <strong>{moneda(total)}</strong></p>}
          <button disabled={!valido} onClick={continuar}>Continuar al pago</button>
        </div>
      )}
    </>
  );
}