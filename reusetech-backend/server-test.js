require("dotenv").config()
const express = require("express")
const multer = require("multer")
const cors = require("cors")
const { Pool } = require("pg")
const path = require("path")
const fs = require("fs")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const { GoogleGenerativeAI } = require("@google/generative-ai")

console.log(" API Key cargada:", process.env.GEMINI_API_KEY)

const app = express()
const port = process.env.PORT || 5000

// Configurar conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// REGISTRO
app.post("/api/register", async (req, res) => {
  const { nombre, apellidos, email, password, rol } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellidos, email, password, rol)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, apellidos, email, hashedPassword, rol],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error de registro:", error)
    res.status(500).json({ message: "Error al registrar usuario" })
  }
})

// LOGIN corregido
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos" })
    }

    const user = result.rows[0]

    const passwordValida = await bcrypt.compare(password, user.password)

    if (!passwordValida) {
      return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos" })
    }

    // const token = jwt.sign({ id: user.id, email: user.email }, 'secreto');

    res.json({ success: true, user }) // puedes incluir token si usas auth
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ success: false, message: "Error en el servidor" })
  }
})

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})
const upload = multer({ storage })

// Ruta para manejar la publicación
app.post("/api/publicaciones", upload.single("foto"), async (req, res) => {
  try {
    const {
      titulo,
      nombredeldispositivo,
      marcaoModelo,
      categoria,
      estado,
      descripcion,
      contacto,
      ubicacion,
      autor_id,
    } = req.body
    const foto = req.file ? req.file.filename : null

    const query = `
    INSERT INTO publicaciones (titulo, nombredeldispositivo, marcaoModelo, categoria, estado, descripcion, contacto, ubicacion, foto, autor_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`

    const values = [
      titulo,
      nombredeldispositivo,
      marcaoModelo,
      categoria,
      estado,
      descripcion,
      contacto,
      ubicacion,
      foto,
      autor_id,
    ]

    const result = await pool.query(query, values)

    res.status(201).json({ message: "Publicación creada con éxito", data: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al guardar en la base de datos" })
  }
})

app.post("/api/mensajes", async (req, res) => {
  const { remitente_id, destinatario_id, publicacion_id, contenido } = req.body
  try {
    const query = `INSERT INTO mensajes (remitente_id, destinatario_id, publicacion_id, contenido) 
                   VALUES ($1, $2, $3, $4) RETURNING *`
    const values = [remitente_id, destinatario_id, publicacion_id, contenido]
    const result = await pool.query(query, values)
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    res.status(500).json({ message: "Error al enviar mensaje" })
  }
})

app.get("/api/mensajes/:publicacion_id/:user1/:user2", async (req, res) => {
  const { publicacion_id, user1, user2 } = req.params

  try {
    const query = `
      SELECT * FROM mensajes 
      WHERE publicacion_id = $1 AND 
            ((remitente_id = $2 AND destinatario_id = $3) OR 
             (remitente_id = $3 AND destinatario_id = $2))
      ORDER BY fecha_envio ASC`

    const values = [publicacion_id, user1, user2]
    const result = await pool.query(query, values)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    res.status(500).json({ message: "Error al obtener mensajes" })
  }
})

// Servir imágenes almacenadas en "uploads"
app.use("/uploads", express.static("uploads"))

app.get("/api/publicaciones", async (req, res) => {
  const { page = 1, limit = 6, categoria, estado, ubicacion } = req.query

  let baseQuery = `SELECT * FROM publicaciones`
  const filters = []
  const values = []

  if (categoria) {
    values.push(`%${categoria}%`)
    filters.push(`categoria ILIKE $${values.length}`)
  }
  if (estado) {
    values.push(`%${estado}%`)
    filters.push(`estado ILIKE $${values.length}`)
  }
  if (ubicacion) {
    values.push(`%${ubicacion}%`)
    filters.push(`ubicacion ILIKE $${values.length}`)
  }

  if (filters.length > 0) {
    baseQuery += ` WHERE ${filters.join(" AND ")}`
  }

  const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)
  baseQuery += ` ORDER BY id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
  values.push(limit, offset)

  try {
    const result = await pool.query(baseQuery, values)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error con paginación:", error)
    res.status(500).json({ message: "Error al obtener publicaciones paginadas" })
  }
})

/// Ruta para obtener una publicación por su ID
app.get("/api/publicaciones/:id", async (req, res) => {
  const { id } = req.params
  try {
    const query = "SELECT * FROM publicaciones WHERE id = $1"
    const result = await pool.query(query, [id])

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0])
    } else {
      res.status(404).json({ message: "Publicación no encontrada" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al obtener los detalles de la publicación" })
  }
})
//  Crear comentario público
app.post("/api/comentarios", async (req, res) => {
  const { publicacion_id, autor_id, contenido } = req.body
  try {
    const result = await pool.query(
      "INSERT INTO comentarios (publicacion_id, autor_id, contenido) VALUES ($1, $2, $3) RETURNING *",
      [publicacion_id, autor_id, contenido],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error al crear comentario:", error)
    res.status(500).json({ message: "Error al guardar comentario" })
  }
})

//  Obtener comentarios públicos por publicación
app.get("/api/comentarios/:publicacion_id", async (req, res) => {
  const { publicacion_id } = req.params
  try {
    const result = await pool.query(
      `SELECT c.*, u.nombre FROM comentarios c 
       JOIN usuarios u ON c.autor_id = u.id 
       WHERE publicacion_id = $1 
       ORDER BY fecha DESC`,
      [publicacion_id],
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error al obtener comentarios:", error)
    res.status(500).json({ message: "Error al obtener comentarios" })
  }
})

// Obtener conversaciones únicas por usuario (tipo bandeja de entrada)
app.get("/api/conversaciones/:userId", async (req, res) => {
  const { userId } = req.params
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
    `

    const result = await pool.query(query, [userId])
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error al obtener conversaciones:", error)
    res.status(500).json({ message: "Error al obtener conversaciones" })
  }
})

app.post("/api/chatbot", async (req, res) => {
  const { mensaje } = req.body

  try {
    console.log(" API Key cargada:", process.env.GEMINI_API_KEY)

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent(mensaje)
    const response = await result.response
    const text = await response.text()

    res.json({ respuesta: text })
  } catch (error) {
    console.error(" Error con Gemini:", error.message || error)
    res.status(500).json({ respuesta: "Hubo un error al obtener la respuesta de la IA." })
  }
})

const http = require("http")
const { Server } = require("socket.io")

// Crear servidor HTTP basado en Express
const server = http.createServer(app)

// Crear instancia de socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Eventos del socket
io.on("connection", (socket) => {
  console.log(" Nuevo cliente conectado:", socket.id)

  // Unirse a una sala
  socket.on("joinRoom", ({ room }) => {
    socket.join(room)
    console.log(`➡️ Cliente ${socket.id} se unió a la sala: ${room}`)
  })

  // Recibir y reenviar mensaje
  socket.on("sendMessage", (message) => {
    io.to(message.room).emit("receiveMessage", message)
  })

  // Desconexión
  socket.on("disconnect", () => {
    console.log(" Cliente desconectado:", socket.id)
  })
})

// Modificar el final para exportar la app
if (require.main === module) {
  server.listen(port, () => {
    console.log(` Servidor con Socket.IO en http://localhost:${port}`)
  })
}

module.exports = app
