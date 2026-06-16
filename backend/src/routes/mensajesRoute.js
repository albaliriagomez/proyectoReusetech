const express = require('express');
const router = express.Router();
const { createMensaje, getMensajes, getConversaciones, getInfoChat, marcarComoLeido } = require('../controllers/mensajesController');

// 1. Rutas de Creación y Lectura de Conversaciones Generales
router.post('/api/mensajes', createMensaje);
router.get('/api/conversaciones/:userId', getConversaciones);
router.put('/api/mensajes/leer/:chatId', marcarComoLeido);

// 2. OBTENER INFO DEL CHAT (¡Esta ruta fija SIEMPRE debe ir arriba!)
router.get('/api/mensajes/info-chat/:publicacion_id/:destinatario_id', getInfoChat);

// 3. Rutas Dinámicas Multi-Parámetro (Comodines van abajo)
router.get('/api/mensajes/:publicacion_id/:user1/:user2', getMensajes);

module.exports = router;