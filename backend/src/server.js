require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const http    = require('http');
const path    = require('path');
const { Server } = require('socket.io');

// ── Rutas ────────────────────────────────────────────────────────────────────
const authRoute          = require('./routes/authRoute');
const usuariosRoute      = require('./routes/usuariosRoute');
const publicacionesRoute = require('./routes/publicacionesRoute');
const mensajesRoute      = require('./routes/mensajesRoute');
const comentariosRoute   = require('./routes/comentariosRoute');
const chatbotRoute       = require('./routes/chatbotRoute');
const diagnosticoRoute   = require('./routes/diagnosticoRoute');
const visionRoute        = require('./routes/visionRoute');

const app  = express();
const port = process.env.PORT || 5000;

// ── Middleware global ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Archivos estáticos ────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Registro de rutas ─────────────────────────────────────────────────────────
app.use(authRoute);
app.use(usuariosRoute);
app.use(publicacionesRoute);
app.use(mensajesRoute);
app.use(comentariosRoute);
app.use(chatbotRoute);
app.use(diagnosticoRoute);
app.use(visionRoute);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:  '*',
    methods: ['GET', 'POST'],
  },
});

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

  socket.on('disconnect', () => {
    console.log(' Cliente desconectado:', socket.id);
  });
});

// ── Arrancar servidor ─────────────────────────────────────────────────────────
server.listen(port, () => {
  console.log(` Servidor con Socket.IO en http://localhost:${port}`);
});
