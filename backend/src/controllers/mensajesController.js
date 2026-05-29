const pool = require('../config/db');
const { registrarEvento } = require('../config/influx');

const createMensaje = async (req, res) => {
  const { remitente_id, destinatario_id, publicacion_id, contenido } = req.body;
  try {
    const query = `INSERT INTO mensajes (remitente_id, destinatario_id, publicacion_id, contenido)
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [remitente_id, destinatario_id, publicacion_id, contenido];
    const result = await pool.query(query, values);

    // 📊 Enviar evento a InfluxDB
    registrarEvento('mensaje', { tipo: 'enviado' }, { count: 1, publicacion_id: parseInt(publicacion_id) || 0 });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

const getMensajes = async (req, res) => {
  const { publicacion_id, user1, user2 } = req.params;

  try {
    const query = `
      SELECT * FROM mensajes
      WHERE publicacion_id = $1 AND
            ((remitente_id = $2 AND destinatario_id = $3) OR
             (remitente_id = $3 AND destinatario_id = $2))
      ORDER BY fecha_envio ASC`;

    const values = [publicacion_id, user1, user2];
    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
};

const getConversaciones = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT DISTINCT ON (publicacion_id, LEAST(remitente_id, destinatario_id), GREATEST(remitente_id, destinatario_id))
        m.*,
        u.nombre AS usuario_nombre,
        p.titulo AS publicacion_titulo
      FROM mensajes m
      JOIN usuarios u ON u.id = CASE
                                  WHEN m.remitente_id = $1 THEN m.destinatario_id
                                  ELSE m.remitente_id
                                END
      JOIN publicaciones p ON p.id = m.publicacion_id
      WHERE m.remitente_id = $1 OR m.destinatario_id = $1
      ORDER BY publicacion_id, LEAST(remitente_id, destinatario_id), GREATEST(remitente_id, destinatario_id), fecha_envio DESC;
    `;

    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ message: 'Error al obtener conversaciones' });
  }
};

module.exports = { createMensaje, getMensajes, getConversaciones };
