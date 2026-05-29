const pool = require('../config/db');

const getUsuarios = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, apellidos, email, rol, activo
       FROM usuarios
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, activo`,
      [activo, id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

module.exports = { getUsuarios, updateUsuario, deleteUsuario };
