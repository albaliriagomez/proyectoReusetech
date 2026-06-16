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

const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, apellidos, email, rol, activo
       FROM usuarios
       WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener usuario por ID:', err);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ ok: true, msg: 'Usuario eliminado correctamente de ReUseTech' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ ok: false, msg: 'Error al eliminar el usuario' });
  }
};

module.exports = { getUsuarios, updateUsuario, deleteUsuario, getUsuarioById };
