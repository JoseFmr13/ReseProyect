import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() =>
    JSON.parse(localStorage.getItem('usuario') || 'null')
  );

  const login = async (user, password) => {
    const { data } = await api.post('/auth/login', { usuario: user, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  };

  const logout = () => {
    localStorage.clear();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}