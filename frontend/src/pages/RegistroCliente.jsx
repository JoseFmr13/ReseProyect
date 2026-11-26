import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useReserva } from '../context/ReservaContext';
import { errorMsg } from '../utils/format';

const vacio = { nombreCompleto: '', identificacion: '', telefono: '', email: '', domicilio: '' };

export default function RegistroCliente() {
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState('');
  const { setCliente } = useReserva();
  const navigate = useNavigate();

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/clientes', form);
      setCliente(data);
      navigate('/reservacion/viaje');
    } catch (err) {
      // Si ya existía, usamos el cliente registrado
      if (err.response?.status === 409) {
        setCliente(err.response.data.cliente);
        navigate('/reservacion/viaje');
      } else {
        setError(errorMsg(err));
      }
    }
  };

  return (
    <form className="tarjeta" onSubmit={enviar}>
      <h2>Registro del cliente</h2>
      <label>Nombre completo</label>
      <input name="nombreCompleto" value={form.nombreCompleto} onChange={cambiar} required />
      <label>Identificación (INE, pasaporte...)</label>
      <input name="identificacion" value={form.identificacion} onChange={cambiar} required />
      <label>Teléfono</label>
      <input name="telefono" value={form.telefono} onChange={cambiar} required />
      <label>Correo electrónico</label>
      <input type="email" name="email" value={form.email} onChange={cambiar} required />
      <label>Domicilio</label>
      <input name="domicilio" value={form.domicilio} onChange={cambiar} required />
      {error && <p className="error">{error}</p>}
      <br />
      <button type="submit">Continuar</button>
    </form>
  );
}