import { Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Panel from './pages/Panel';
import Clientes from './pages/Clientes';
import Disponibilidad from './pages/Disponibilidad';
import RegistroCliente from './pages/RegistroCliente';
import SeleccionViaje from './pages/SeleccionViaje';
import Pago from './pages/Pago';
import Administracion from './pages/Administracion';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RutaProtegida />}>
        <Route path="/" element={<Panel />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/disponibilidad" element={<Disponibilidad />} />
        <Route path="/reservacion/cliente" element={<RegistroCliente />} />
        <Route path="/reservacion/viaje" element={<SeleccionViaje />} />
        <Route path="/reservacion/pago" element={<Pago />} />
        <Route path="/administracion" element={<Administracion />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}