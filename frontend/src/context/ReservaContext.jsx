import { createContext, useContext, useState } from 'react';

const ReservaContext = createContext();
export const useReserva = () => useContext(ReservaContext);

export function ReservaProvider({ children }) {
  const [cliente, setCliente] = useState(null);
  const [seleccion, setSeleccion] = useState(null); // { viaje, tipoCamarote, numeroPasajeros }

  const reiniciar = () => {
    setCliente(null);
    setSeleccion(null);
  };

  return (
    <ReservaContext.Provider value={{ cliente, setCliente, seleccion, setSeleccion, reiniciar }}>
      {children}
    </ReservaContext.Provider>
  );
}