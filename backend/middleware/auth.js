import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) return res.status(401).json({ msg: 'No autenticado' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};

export const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ msg: 'Solo el administrador puede hacer esto' });
  }
  next();
};