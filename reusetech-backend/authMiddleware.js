// authMiddleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // Obtener el token del header de autorización
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(401).json({ error: 'Acceso denegado. Se requiere autenticación.' });
  }
  
  try {
    // El formato típico es "Bearer TOKEN"
    const token = bearerHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    // Verificar el token
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verificado;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = {
  verificarToken
};