import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useReserva } from '../context/ReservaContext';
import Icono from '../components/Icono';
import { fecha, moneda, errorMsg } from '../utils/format';
import './Panel.css';

const saludo = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
};

export default function Panel() {
  const { usuario } = useAuth();
  const { reiniciar } = useReserva();
  const esAdmin = usuario.rol === 'admin';

  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      const { data } = await api.get('/reservaciones/resumen');
      setDatos(data);
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  useEffect(() => { cargar(); }, []);

  const resolver = async (id, decision) => {
    try {
      await api.patch(`/reservaciones/${id}/solicitud`, { decision });
      await cargar();
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const encabezado = (
    <div className="panel-encabezado">
      <h1>{saludo()}, {usuario.nombre.split(' ')[0]}</h1>
      <p className="panel-fecha">{hoy}</p>
    </div>
  );

  if (error && !datos) return <>{encabezado}<p className="error">{error}</p></>;
  if (!datos) return <>{encabezado}<p className="vacio">Cargando información...</p></>;

  const estadisticas = [
    { titulo: esAdmin ? 'Reservaciones activas' : 'Tus reservaciones activas', valor: datos.confirmadas, icono: 'check', tono: 'azul' },
    { titulo: esAdmin ? 'Ingresos totales' : 'Ventas realizadas', valor: moneda(datos.ingresos), icono: 'dinero', tono: 'verde' },
    { titulo: 'Solicitudes pendientes', valor: datos.solicitudesPendientes, icono: 'reloj', tono: 'ambar' },
    { titulo: 'Canceladas', valor: datos.canceladas, icono: 'prohibido', tono: 'rojo' },
  ];

  const acciones = [
    { to: '/reservacion/cliente', icono: 'plus', titulo: 'Nueva reservación', texto: 'Registra al cliente y reserva su viaje', principal: true, nueva: true },
    { to: '/administracion', icono: 'lista', titulo: 'Consultar reservaciones', texto: 'Busca, edita y da seguimiento' },
    { to: '/disponibilidad', icono: 'cama', titulo: 'Disponibilidad', texto: 'Camarotes libres por viaje' },
    { to: '/clientes', icono: 'usuarios', titulo: 'Clientes', texto: 'Directorio y registro de clientes' },
    {
      to: '/administracion?pendientes=1', icono: 'reembolso', titulo: 'Cancelaciones y reembolsos',
      texto: esAdmin ? 'Revisa y resuelve solicitudes' : 'Consulta el estado de tus solicitudes',
      contador: datos.solicitudesPendientes,
    },
  ];

  return (
    <div className="panel-page">
      {encabezado}
      {error && <p className="error">{error}</p>}

      <section className="stats">
        {estadisticas.map((s) => (
          <div className="stat" key={s.titulo}>
            <span className={`stat-icono tono-${s.tono}`}><Icono nombre={s.icono} tamano={24} /></span>
            <div>
              <div className="stat-valor">{s.valor}</div>
              <div className="stat-titulo">{s.titulo}</div>
            </div>
          </div>
        ))}
      </section>

      <h3 className="seccion-titulo">Accesos rápidos</h3>
      <section className="acciones">
        {acciones.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`accion ${a.principal ? 'principal' : ''}`}
            onClick={() => a.nueva && reiniciar()}
          >
            <span className="accion-icono"><Icono nombre={a.icono} tamano={22} /></span>
            <span className="accion-titulo">{a.titulo}</span>
            <span className="accion-texto">{a.texto}</span>
            {a.contador > 0 && <span className="contador">{a.contador}</span>}
          </Link>
        ))}
      </section>

      <div className="panel-cols">
        {/* Columna izquierda: reservaciones recientes */}
        <section className="caja">
          <div className="caja-cab">
            <h3>{esAdmin ? 'Reservaciones recientes' : 'Tus reservaciones recientes'}</h3>
            <Link to="/administracion" className="enlace-ver">
              Ver todas <Icono nombre="flecha" tamano={16} />
            </Link>
          </div>
          {datos.recientes.length === 0 ? (
            <p className="vacio">Aún no hay reservaciones.</p>
          ) : (
            <ul className="lista">
              {datos.recientes.map((r) => (
                <li className="item" key={r._id}>
                  <div className="item-principal">
                    <div className="item-titulo">{r.cliente?.nombreCompleto}</div>
                    <div className="item-sub">
                      {r.folio} · {r.viaje?.destino} · {r.tipoCamarote} · {fecha(r.createdAt)}
                    </div>
                  </div>
                  <div className="item-der">
                    <strong>{moneda(r.importe)}</strong>
                    <span className={`badge ${r.estado === 'confirmada' ? 'ok' : 'danger'}`}>{r.estado}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Columna derecha: solicitudes y próximas salidas */}
        <div>
          <section className="caja">
            <div className="caja-cab">
              <h3>{esAdmin ? 'Solicitudes por resolver' : 'Solicitudes en revisión'}</h3>
            </div>
            {datos.pendientes.length === 0 ? (
              <p className="vacio">No hay solicitudes pendientes.</p>
            ) : (
              <ul className="lista">
                {datos.pendientes.map((r) => (
                  <li className="solicitud" key={r._id}>
                    <div className="item-titulo">
                      {r.solicitud.tipo === 'reembolso' ? 'Reembolso' : 'Cancelación'} · {r.folio}
                    </div>
                    <div className="item-sub">{r.cliente?.nombreCompleto}</div>
                    {r.solicitud.motivo && <div className="item-sub">Motivo: {r.solicitud.motivo}</div>}
                    {esAdmin ? (
                      <div className="solicitud-acciones">
                        <button className="btn-mini aprobar" onClick={() => resolver(r._id, 'aprobada')}>
                          <Icono nombre="check" tamano={16} /> Aprobar
                        </button>
                        <button className="btn-mini rechazar" onClick={() => resolver(r._id, 'rechazada')}>
                          <Icono nombre="x" tamano={16} /> Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="badge warn">Esperando al administrador</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="caja">
            <div className="caja-cab">
              <h3>Próximas salidas</h3>
              <Link to="/disponibilidad" className="enlace-ver">
                Detalle <Icono nombre="flecha" tamano={16} />
              </Link>
            </div>
            {datos.proximosViajes.length === 0 ? (
              <p className="vacio">No hay viajes programados.</p>
            ) : (
              <ul className="lista">
                {datos.proximosViajes.map((v) => {
                  const libres = v.camarotes.reduce((suma, c) => suma + c.disponibles, 0);
                  const desde = Math.min(...v.camarotes.map((c) => c.precioPorPersona));
                  return (
                    <li className="item" key={v._id}>
                      <div className="item-principal">
                        <div className="item-titulo">{v.destino}</div>
                        <div className="item-sub">{fecha(v.fechaSalida)} · {v.duracionDias} días</div>
                      </div>
                      <div className="item-der">
                        <strong>Desde {moneda(desde)}</strong>
                        <span className={`badge ${libres > 5 ? 'ok' : 'warn'}`}>{libres} camarotes libres</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}