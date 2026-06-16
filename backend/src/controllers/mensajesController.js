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

  // 🛡️ Filtro de seguridad: Evita enviar cadenas de texto a columnas integer en PostgreSQL
  if (isNaN(publicacion_id) || isNaN(user1) || isNaN(user2)) {
    return res.status(400).json({ 
      message: 'Los parámetros de la consulta deben ser identificadores numéricos válidos.' 
    });
  }

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
      SELECT * FROM (
        SELECT DISTINCT ON (publicacion_id, LEAST(remitente_id, destinatario_id), GREATEST(remitente_id, destinatario_id))
          m.*,
          u.nombre || ' ' || COALESCE(u.apellidos, '') AS usuario_nombre,
          p.titulo AS publicacion_titulo,
          (
            SELECT COUNT(*)::int 
            FROM mensajes m2 
            WHERE m2.publicacion_id = m.publicacion_id 
              AND m2.remitente_id = u.id 
              AND m2.destinatario_id = $1 
              AND m2.leido = false
          ) AS no_leidos
        FROM mensajes m
        JOIN usuarios u ON u.id = CASE
                                    WHEN m.remitente_id = $1 THEN m.destinatario_id
                                    ELSE m.remitente_id
                                  END
        JOIN publicaciones p ON p.id = m.publicacion_id
        WHERE m.remitente_id = $1 OR m.destinatario_id = $1
        ORDER BY publicacion_id, LEAST(remitente_id, destinatario_id), GREATEST(remitente_id, destinatario_id), fecha_envio DESC
      ) t
      ORDER BY t.fecha_envio DESC;
    `;

    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ message: 'Error al obtener conversaciones' });
  }
};

const getInfoChat = async (req, res) => {
  const { publicacion_id, destinatario_id } = req.params;
  try {
    const query = `
      SELECT 
        u.nombre,
        u.apellidos,
        p.titulo AS publicacion_titulo,
        p.estado AS publicacion_estado
      FROM usuarios u
      JOIN publicaciones p ON p.id = $1
      WHERE u.id = $2
    `;
    const result = await pool.query(query, [publicacion_id, destinatario_id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Datos de chat no encontrados' });
    }
  } catch (error) {
    console.error('Error al obtener info de chat:', error);
    res.status(500).json({ message: 'Error al obtener info de chat' });
  }
};

const marcarComoLeido = async (req, res) => {
  const { chatId } = req.params;
  const { lectorId } = req.body;

  try {
    const parts = chatId.split('-');
    if (parts.length !== 3) {
      return res.status(400).json({ message: 'Formato de chatId inválido' });
    }
    const publicacion_id = parseInt(parts[0]);
    const u1 = parseInt(parts[1]);
    const u2 = parseInt(parts[2]);
    const lector_id = parseInt(lectorId || req.query.lectorId);

    if (!lector_id) {
      return res.status(400).json({ message: 'Se requiere el ID del lector (lectorId)' });
    }

    const otro_id = lector_id === u1 ? u2 : u1;

    const query = `
      UPDATE mensajes
      SET leido = true
      WHERE publicacion_id = $1
        AND remitente_id = $2
        AND destinatario_id = $3
        AND leido = false
      RETURNING *
    `;
    const result = await pool.query(query, [publicacion_id, otro_id, lector_id]);
    res.status(200).json({ message: 'Mensajes marcados como leídos', count: result.rowCount });
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    res.status(500).json({ message: 'Error al marcar mensajes como leídos' });
  }
};

module.exports = { createMensaje, getMensajes, getConversaciones, getInfoChat, marcarComoLeido };
