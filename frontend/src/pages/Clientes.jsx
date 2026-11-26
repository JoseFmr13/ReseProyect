import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useReserva } from '../context/ReservaContext';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [q, setQ] = useState('');
  const { reiniciar, setCliente } = useReserva();
  const navigate = useNavigate();

  const buscar = async () => {
    const { data } = await api.get('/clientes', { params: { q } });
    setClientes(data);
  };

  useEffect(() => { buscar(); }, []);

  const reservar = (c) => {
    reiniciar();
    setCliente(c);
    navigate('/reservacion/viaje');
  };

  return (
    <>
      <h2>Clientes</h2>
      <div className="fila tarjeta">
        <input placeholder="Buscar por nombre o identificación" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={buscar}>Buscar</button>
      </div>
      <table>
        <thead><tr><th>Nombre</th><th>Identificación</th><th>Teléfono</th><th>Correo</th><th></th></tr></thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c._id}>
              <td>{c.nombreCompleto}</td><td>{c.identificacion}</td><td>{c.telefono}</td><td>{c.email}</td>
              <td><button onClick={() => reservar(c)}>Reservar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}