const pool = require('../config/db');

const createComentario = async (req, res) => {
  const { publicacion_id, autor_id, contenido } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO comentarios (publicacion_id, autor_id, contenido) VALUES ($1, $2, $3) RETURNING *',
      [publicacion_id, autor_id, contenido]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ message: 'Error al guardar comentario' });
  }
};

const getComentarios = async (req, res) => {
  const { publicacion_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, u.nombre FROM comentarios c
       JOIN usuarios u ON c.autor_id = u.id
       WHERE publicacion_id = $1
       ORDER BY fecha DESC`,
      [publicacion_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ message: 'Error al obtener comentarios' });
  }
};

module.exports = { createComentario, getComentarios };
