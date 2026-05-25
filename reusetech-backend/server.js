require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const chatbotRoute = require('./chatbotRoute');
const diagnosticoRoute = require('./diagnosticoRoute');
const visionRoute = require('./visionRoute');

const { registrarEvento } = require('./influx');

const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log(" API Key cargada:", process.env.GEMINI_API_KEY);


const app = express();
const port = process.env.PORT || 5000;

// Configurar conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(chatbotRoute);
app.use(diagnosticoRoute);
app.use(visionRoute);

// REGISTRO
app.post('/api/register', async (req, res) => {
  const { nombre, apellidos, email, password, rol } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellidos, email, password, rol)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, apellidos, email, hashedPassword, rol]
    );
   // 📊 Enviar evento a InfluxDB
    registrarEvento('registro', { rol: rol || 'usuario' }, { count: 1 });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error de registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

// LOGIN corregido
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }

    const user = result.rows[0];

    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }

    //  En este punto la contraseña es correcta, puedes generar un token si deseas
    // const token = jwt.sign({ id: user.id, email: user.email }, 'secreto');

    // 📊 Enviar evento a InfluxDB
    registrarEvento('login', { rol: user.rol || 'usuario' }, { count: 1, user_id: user.id });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

const requireAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'No autorizado' });
  try {
    const { rows } = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [userId]);
    if (!rows[0] || rows[0].rol !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
  } catch { res.status(500).json({ message: 'Error de autenticación' }); }
};
 
// ── GET todos los usuarios ────────────────────────────────────────────────────
app.get('/api/usuarios', async (req, res) => {
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
});
 
// ── PATCH usuario — bloquear/activar ─────────────────────────────────────────
app.patch('/api/usuarios/:id', async (req, res) => {
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
});
 
// ── DELETE usuario ────────────────────────────────────────────────────────────
app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ruta para manejar la publicación
// Ruta para manejar la publicación
app.post('/api/publicaciones', upload.single('foto'), async (req, res) => {
  try {
    const { titulo, nombredeldispositivo, marcaoModelo, categoria, estado, descripcion, contacto, ubicacion, autor_id } = req.body;
    const foto = req.file ? req.file.filename : null;

    const query = `
    INSERT INTO publicaciones (titulo, nombredeldispositivo, marcaoModelo, categoria, estado, descripcion, contacto, ubicacion, foto, autor_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
  
    const values = [titulo, nombredeldispositivo, marcaoModelo, categoria, estado, descripcion, contacto, ubicacion, foto, autor_id];
  
    const result = await pool.query(query, values);

    // 📊 Enviar evento a InfluxDB
    registrarEvento('publicacion', {
      categoria: categoria || 'sin_categoria',
      estado: estado || 'sin_estado',
      ubicacion: ubicacion || 'sin_ubicacion'
    }, { count: 1, autor_id: parseInt(autor_id) || 0 });

    res.status(201).json({ message: 'Publicación creada con éxito', data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar en la base de datos' });
  }
});

app.patch('/api/publicaciones/:id', async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE publicaciones SET visible = $1 WHERE id = $2 RETURNING id, titulo, visible`,
      [visible, id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Publicación no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar publicación:', err);
    res.status(500).json({ message: 'Error al actualizar publicación' });
  }
});

app.delete('/api/publicaciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener el nombre de la foto antes de borrar
    const { rows } = await pool.query('SELECT foto FROM publicaciones WHERE id = $1', [id]);
    if (rows[0]?.foto) {
      const filePath = path.join('uploads', rows[0].foto);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // borra imagen del disco
    }
    await pool.query('DELETE FROM publicaciones WHERE id = $1', [id]);
    res.json({ message: 'Publicación eliminada' });
  } catch (err) {
    console.error('Error al eliminar publicación:', err);
    res.status(500).json({ message: 'Error al eliminar publicación' });
  }
});

app.post('/api/mensajes', async (req, res) => {
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
});

app.get('/api/mensajes/:publicacion_id/:user1/:user2', async (req, res) => {
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
});


// Servir imágenes almacenadas en "uploads"
app.use('/uploads', express.static('uploads'));

app.get('/api/publicaciones', async (req, res) => {
  try {
    const {
      q        = '',
      orden    = 'reciente',
      page     = '1',
      limit    = '12',
    } = req.query;
 
    // Arrays de filtros multi-valor (axios serializa arrays como param repetido)
    const categorias  = [].concat(req.query.categoria  || []).filter(Boolean);
    const estados     = [].concat(req.query.estado     || []).filter(Boolean);
    const ubicaciones = [].concat(req.query.ubicacion  || []).filter(Boolean);
 
    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12)); // máx 50 por seguridad
    const offset   = (pageNum - 1) * limitNum;
 
    // ── Construcción dinámica de la query ────────────────────────────────────
    const values = [];
    const filters = [];
 
    // Full-text search (PostgreSQL ts_vector)
    // Busca en titulo, descripcion y marcaoModelo con operador de prefijo (prefix match)
    if (q.trim()) {
      // plainto_tsquery es tolerante: no explota con caracteres especiales
      // Usamos ILIKE como fallback simple y compatible si no tienes tsvector
      values.push(`%${q.trim()}%`);
      const idx = values.length;
      filters.push(`(
        titulo           ILIKE $${idx}
        OR descripcion   ILIKE $${idx}
        OR marcaoModelo  ILIKE $${idx}
        OR nombredeldispositivo ILIKE $${idx}
      )`);
    }
 
    // Filtro categoría (OR entre valores seleccionados)
    if (categorias.length > 0) {
      const placeholders = categorias.map(c => {
        values.push(`%${c}%`);
        return `categoria ILIKE $${values.length}`;
      });
      filters.push(`(${placeholders.join(' OR ')})`);
    }
 
    // Filtro estado
    if (estados.length > 0) {
      const placeholders = estados.map(e => {
        values.push(`%${e}%`);
        return `estado ILIKE $${values.length}`;
      });
      filters.push(`(${placeholders.join(' OR ')})`);
    }
 
    // Filtro ubicación
    if (ubicaciones.length > 0) {
      const placeholders = ubicaciones.map(u => {
        values.push(`%${u}%`);
        return `ubicacion ILIKE $${values.length}`;
      });
      filters.push(`(${placeholders.join(' OR ')})`);
    }
 
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
 
    // ── Ordenamiento ─────────────────────────────────────────────────────────
    const orderMap = {
      reciente: 'fecha DESC',
      antiguo:  'fecha ASC',
      az:       'titulo ASC',
      za:       'titulo DESC',
    };
    const orderSQL = orderMap[orden] ?? 'fecha DESC';
 
    // ── COUNT total (para paginación del frontend) ────────────────────────────
    const countQuery  = `SELECT COUNT(*) FROM publicaciones ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total       = parseInt(countResult.rows[0].count, 10);
 
    // ── Datos paginados ───────────────────────────────────────────────────────
    const dataQuery = `
      SELECT
        id, titulo, descripcion, categoria, estado, ubicacion,
        foto, fecha, marcaoModelo, nombredeldispositivo, contacto, autor_id
      FROM publicaciones
      ${whereClause}
      ORDER BY ${orderSQL}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limitNum, offset);
 
    const dataResult = await pool.query(dataQuery, values);
 
    res.status(200).json({
      rows:  dataResult.rows,
      total,
      page:  pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
 
  } catch (error) {
    console.error('Error en GET /api/publicaciones:', error);
    res.status(500).json({ message: 'Error al obtener publicaciones' });
  }
});

app.get('/api/publicaciones/facets', async (req, res) => {
  try {
    const [categorias, estados, ubicaciones] = await Promise.all([
      pool.query(`SELECT categoria AS value, COUNT(*) AS count FROM publicaciones WHERE categoria IS NOT NULL GROUP BY categoria ORDER BY count DESC`),
      pool.query(`SELECT estado    AS value, COUNT(*) AS count FROM publicaciones WHERE estado    IS NOT NULL GROUP BY estado    ORDER BY count DESC`),
      pool.query(`SELECT ubicacion AS value, COUNT(*) AS count FROM publicaciones WHERE ubicacion IS NOT NULL GROUP BY ubicacion ORDER BY count DESC LIMIT 20`),
    ]);
 
    res.json({
      categorias:  categorias.rows,
      estados:     estados.rows,
      ubicaciones: ubicaciones.rows,
    });
  } catch (err) {
    console.error('Error en /api/publicaciones/facets:', err);
    res.status(500).json({ message: 'Error al obtener facetas' });
  }
});
 


/// Ruta para obtener una publicación por su ID
app.get('/api/publicaciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM publicaciones WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Publicación no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los detalles de la publicación' });
  }
});
//  Crear comentario público
app.post('/api/comentarios', async (req, res) => {
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
});

//  Obtener comentarios públicos por publicación
app.get('/api/comentarios/:publicacion_id', async (req, res) => {
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
});

// Obtener conversaciones únicas por usuario (tipo bandeja de entrada)
app.get('/api/conversaciones/:userId', async (req, res) => {
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
});




app.post('/api/chatbot', async (req, res) => {
  const { mensaje } = req.body;

  try {
    console.log("🔑 API Key cargada:", process.env.GEMINI_API_KEY);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(mensaje);
    const response = await result.response;
    const text = await response.text();

    // 📊 Enviar evento a InfluxDB
    registrarEvento('chatbot', { estado: 'exitoso' }, { count: 1, longitud_mensaje: mensaje.length });

    res.json({ respuesta: text });
  } catch (error) {
    console.error(" Error con Gemini:", error.message || error);
    res.status(500).json({ respuesta: "Hubo un error al obtener la respuesta de la IA." });
  }
});



// Route to get publications by user ID
app.get('/api/publicaciones/usuario/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = 'SELECT * FROM publicaciones WHERE autor_id = $1 ORDER BY id DESC';
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener publicaciones del usuario:', error);
    res.status(500).json({ message: 'Error al obtener publicaciones del usuario' });
  }
});




const http = require('http');
const { Server } = require('socket.io');

// Crear servidor HTTP basado en Express
const server = http.createServer(app);

// Crear instancia de socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Eventos del socket
io.on('connection', (socket) => {
  console.log(' Nuevo cliente conectado:', socket.id);

  // Unirse a una sala
  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    console.log(` Cliente ${socket.id} se unió a la sala: ${room}`);
  });

  // Recibir y reenviar mensaje
  socket.on('sendMessage', (message) => {
    io.to(message.room).emit('receiveMessage', message);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log(' Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(` Servidor con Socket.IO en http://localhost:${port}`);
});

