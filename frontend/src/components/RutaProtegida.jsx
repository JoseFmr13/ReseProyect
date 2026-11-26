import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReserva } from '../context/ReservaContext';
import Icono from './Icono';
import './Layout.css';

const items = [
  { to: '/', icono: 'inicio', texto: 'Inicio', activo: (p) => p === '/' },
  { to: '/reservacion/cliente', icono: 'plus', texto: 'Nueva reservación', nueva: true,
    activo: (p) => p.startsWith('/reservacion') },
  { to: '/administracion', icono: 'lista', texto: 'Reservaciones',
    activo: (p, s) => p === '/administracion' && !s.includes('pendientes') },
  { to: '/administracion?pendientes=1', icono: 'reembolso', texto: 'Cancelaciones y reembolsos',
    activo: (p, s) => p === '/administracion' && s.includes('pendientes') },
  { to: '/disponibilidad', icono: 'cama', texto: 'Disponibilidad', activo: (p) => p === '/disponibilidad' },
  { to: '/clientes', icono: 'usuarios', texto: 'Clientes', activo: (p) => p === '/clientes' },
];

export default function RutaProtegida() {
  const { usuario, logout } = useAuth();
  const { reiniciar } = useReserva();
  const { pathname, search } = useLocation();
  const [abierto, setAbierto] = useState(false);

  if (!usuario) return <Navigate to="/login" replace />;

  const rol = usuario.rol === 'admin' ? 'Administrador' : 'Empleado';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${abierto ? 'abierto' : ''}`}>
        <div className="sidebar-marca">
          <span className="marca-icono"><Icono nombre="barco" tamano={22} /></span>
          <span>Crucero<br /><small>Reservaciones</small></span>
        </div>

        <nav className="sidebar-nav">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={`nav-item ${it.activo(pathname, search) ? 'activo' : ''}`}
              onClick={() => { if (it.nueva) reiniciar(); setAbierto(false); }}
            >
              <Icono nombre={it.icono} />
              {it.texto}
            </Link>
          ))}
        </nav>

        <div className="sidebar-pie">
          <div className="usuario-caja">
            <span className="avatar">{usuario.nombre.charAt(0).toUpperCase()}</span>
            <div>
              <div className="usuario-nombre">{usuario.nombre}</div>
              <div className="usuario-rol">{rol}</div>
            </div>
          </div>
          <button className="btn-salir" onClick={logout}>
            <Icono nombre="salir" tamano={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className={`app-overlay ${abierto ? 'visible' : ''}`} onClick={() => setAbierto(false)} />

      <div className="app-contenido">
        <div className="topbar-movil">
          <button className="btn-menu" onClick={() => setAbierto(true)} aria-label="Abrir menú">
            <Icono nombre="menu" />
          </button>
          <strong>Crucero · Reservaciones</strong>
        </div>
        {/* El key vuelve a montar la página al cambiar de filtro (reservaciones vs. solicitudes) */}
        <main className="app-main">
          <Outlet key={pathname + search} />
        </main>
      </div>
    </div>
  );
}