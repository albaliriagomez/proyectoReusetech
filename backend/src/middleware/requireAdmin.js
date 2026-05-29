const pool = require('../config/db');

const requireAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'No autorizado' });
  try {
    const { rows } = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [userId]);
    if (!rows[0] || rows[0].rol !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
  } catch { res.status(500).json({ message: 'Error de autenticación' }); }
};

module.exports = { requireAdmin };
