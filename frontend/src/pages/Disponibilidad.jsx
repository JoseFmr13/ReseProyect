import { useEffect, useState } from 'react';
import api from '../services/api';
import { fecha, moneda } from '../utils/format';

export default function Disponibilidad() {
  const [viajes, setViajes] = useState([]);
  const [destino, setDestino] = useState('');

  const cargar = async () => {
    const { data } = await api.get('/viajes', { params: { destino } });
    setViajes(data);
  };

  useEffect(() => { cargar(); }, []);

  return (
    <>
      <h2>Disponibilidad</h2>
      <div className="fila tarjeta">
        <input placeholder="Destino (ej. Caribe)" value={destino} onChange={(e) => setDestino(e.target.value)} />
        <button onClick={cargar}>Buscar</button>
      </div>
      {viajes.map((v) => (
        <div className="tarjeta" key={v._id}>
          <strong>{v.destino}</strong> · sale {fecha(v.fechaSalida)} · {v.duracionDias} días
          <table>
            <thead><tr><th>Camarote</th><th>Precio por persona</th><th>Capacidad</th><th>Disponibles</th></tr></thead>
            <tbody>
              {v.camarotes.map((c) => (
                <tr key={c.tipo}>
                  <td>{c.tipo}</td><td>{moneda(c.precioPorPersona)}</td>
                  <td>{c.capacidadPersonas}</td><td>{c.disponibles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}