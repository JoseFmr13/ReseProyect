import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const login = async (req, res) => {
  const { usuario, password } = req.body;
  const user = await Usuario.findOne({ usuario: usuario?.toLowerCase() });

  if (!user || !(await user.compararPassword(password))) {
    return res.status(401).json({ msg: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign(
    { id: user._id, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, usuario: { id: user._id, nombre: user.nombre, rol: user.rol } });
};