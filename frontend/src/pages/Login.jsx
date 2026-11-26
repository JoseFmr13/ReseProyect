import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMsg } from '../utils/format';
import './Login.css';

const Icono = ({ children }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const IconoUsuario = () => (
  <Icono><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></Icono>
);
const IconoCandado = () => (
  <Icono><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Icono>
);
const IconoOjo = () => (
  <Icono><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icono>
);
const IconoOjoCerrado = () => (
  <Icono>
    <path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 4.1-5.1" />
    <path d="M9.9 4.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2" />
    <path d="M1 1l22 22" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Icono>
);

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(user, password);
      navigate('/');
    } catch (err) {
      setError(errorMsg(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      {/* Panel izquierdo: portada */}
      <aside className="login-hero">
        <div className="hero-contenido">
          <div className="hero-logo"></div>
          <h1>Bienvenido a bordo</h1>
          <p className="hero-sub">Sistema de reservaciones del crucero</p>
          <ul className="hero-lista">
            <li>Reservaciones en pocos pasos</li>
            <li>Disponibilidad de camarotes en tiempo real</li>
            <li>Control de cancelaciones y reembolsos</li>
          </ul>
        </div>

        <svg className="ola ola-1" viewBox="0 0 2400 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60 C150 0 450 0 600 60 C750 120 1050 120 1200 60 C1350 0 1650 0 1800 60 C1950 120 2250 120 2400 60 V120 H0 Z" />
        </svg>
        <svg className="ola ola-2" viewBox="0 0 2400 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60 C150 0 450 0 600 60 C750 120 1050 120 1200 60 C1350 0 1650 0 1800 60 C1950 120 2250 120 2400 60 V120 H0 Z" />
        </svg>
      </aside>

      {/* Panel derecho: formulario */}
      <main className="login-lado">
        <form className="login-form" onSubmit={enviar}>
          <div className="marca-movil">Crucero · Reservaciones</div>

          <h2>Iniciar sesión</h2>
          <p className="login-sub">Acceso exclusivo para empleados y administradores</p>

          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="campo">
            <label htmlFor="usuario">Usuario</label>
            <div className="campo-input">
              <span className="campo-icono"><IconoUsuario /></span>
              <input
                id="usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Tu usuario"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <div className="campo-input">
              <span className="campo-icono"><IconoCandado /></span>
              <input
                id="password"
                type={mostrar ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="ojo"
                onClick={() => setMostrar(!mostrar)}
                aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrar ? <IconoOjoCerrado /> : <IconoOjo />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? <span className="spinner" /> : 'Entrar'}
          </button>

          <p className="login-pie">Si olvidaste tus datos, contacta al administrador.</p>
        </form>
      </main>
    </div>
  );
}