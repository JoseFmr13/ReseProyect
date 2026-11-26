const rutas = {
  inicio: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  lista: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4" /></>,
  cama: <><path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" /><circle cx="7" cy="11" r="1.5" /></>,
  usuarios: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.8 3.5 2.9 3.5 5.7" /></>,
  reembolso: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  salir: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  barco: <><path d="M2 19c2 2 4 2 6 0s4-2 6 0 4 2 6 0" /><path d="M4 15l1.5-6h13L20 15z" /><path d="M12 9V4h4" /></>,
  dinero: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></>,
  check: <path d="M5 12l5 5L20 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  prohibido: <><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></>,
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
};

export default function Icono({ nombre, tamano = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={tamano} height={tamano} fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {rutas[nombre]}
    </svg>
  );
}