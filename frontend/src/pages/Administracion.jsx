import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fecha, moneda, errorMsg } from '../utils/format';

export default function Administracion() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'admin';
  const [params] = useSearchParams();

  const [lista, setLista] = useState([]);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [soloPend, setSoloPend] = useState(params.get('pendientes') === '1');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ notas: '', numeroPasajeros: 1 });
  const [msg, setMsg] = useState('');

  const cargar = async () => {
    const p = {};
    if (q) p.q = q;
    if (estado) p.estado = estado;
    if (soloPend) p.solicitud = 'pendiente';
    const { data } = await api.get('/reservaciones', { params: p });
    setLista(data);
  };

  useEffect(() => { cargar(); }, [estado, soloPend]);

  const ejecutar = async (accion) => {
    try {
      await accion();
      setMsg('');
      await cargar();
    } catch (err) {
      setMsg(errorMsg(err));
    }
  };

  const abrirEdicion = (r) => {
    setEditando(r._id);
    setForm({ notas: r.notas, numeroPasajeros: r.numeroPasajeros });
  };

  const guardar = (id) =>
    ejecutar(async () => {
      await api.put(`/reservaciones/${id}`, { notas: form.notas, numeroPasajeros: Number(form.numeroPasajeros) });
      setEditando(null);
    });

  const solicitar = (id, tipo) => {
    const motivo = window.prompt('Motivo de la solicitud:');
    if (motivo === null) return;
    ejecutar(() => api.post(`/reservaciones/${id}/solicitud`, { tipo, motivo }));
  };

  const resolver = (id, decision) =>
    ejecutar(() => api.patch(`/reservaciones/${id}/solicitud`, { decision }));

  return (
    <>
      <h2>Administración de reservaciones</h2>

      <div className="fila tarjeta">
        <div><label>Folio</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="RES-..." /></div>
        <div>
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={soloPend} onChange={(e) => setSoloPend(e.target.checked)} />
          Solo solicitudes pendientes
        </label>
        <button onClick={cargar}>Buscar</button>
      </div>

      {msg && <p className="error">{msg}</p>}

      <table>
        <thead>
          <tr><th>Folio</th><th>Cliente</th><th>Viaje</th><th>Pasajeros</th><th>Importe</th><th>Estado</th><th>Solicitud</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {lista.map((r) => (
            <tr key={r._id}>
              <td>{r.folio}</td>
              <td>{r.cliente?.nombreCompleto}</td>
              <td>{r.viaje?.destino}<br /><small>{r.viaje && fecha(r.viaje.fechaSalida)} · {r.tipoCamarote}</small></td>
              <td>
                {editando === r._id
                  ? <input type="number" min="1" value={form.numeroPasajeros} onChange={(e) => setForm({ ...form, numeroPasajeros: e.target.value })} />
                  : r.numeroPasajeros}
              </td>
              <td>{moneda(r.importe)}<br /><small>pago: {r.pago.estado}</small></td>
              <td><span className="etiqueta">{r.estado}</span></td>
              <td>
                {r.solicitud?.estado
                  ? <>{r.solicitud.tipo} <span className="etiqueta">{r.solicitud.estado}</span><br /><small>{r.solicitud.motivo}</small></>
                  : '—'}
              </td>
              <td>
                {editando === r._id ? (
                  <>
                    <textarea rows="2" placeholder="Notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
                    <button onClick={() => guardar(r._id)}>Guardar</button>{' '}
                    <button className="btn-sec" onClick={() => setEditando(null)}>Cancelar</button>
                  </>
                ) : (
                  r.estado === 'confirmada' && (
                    <>
                      <button onClick={() => abrirEdicion(r)}>Editar</button>{' '}
                      {r.solicitud?.estado !== 'pendiente' && (
                        <>
                          <button className="btn-peligro" onClick={() => solicitar(r._id, 'cancelacion')}>Solicitar cancelación</button>{' '}
                          <button className="btn-peligro" onClick={() => solicitar(r._id, 'reembolso')}>Solicitar reembolso</button>
                        </>
                      )}
                      {esAdmin && r.solicitud?.estado === 'pendiente' && (
                        <>
                          <button className="btn-ok" onClick={() => resolver(r._id, 'aprobada')}>Aprobar</button>{' '}
                          <button className="btn-sec" onClick={() => resolver(r._id, 'rechazada')}>Rechazar</button>
                        </>
                      )}
                      {!esAdmin && r.solicitud?.estado === 'pendiente' && <small>Esperando al administrador</small>}
                    </>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}