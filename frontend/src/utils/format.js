export const moneda = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

export const fecha = (d) => new Date(d).toLocaleDateString('es-MX');

export const errorMsg = (e) => e.response?.data?.msg || 'Ocurrió un error, intenta de nuevo';