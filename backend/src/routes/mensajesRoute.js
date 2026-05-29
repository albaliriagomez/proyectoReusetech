const express = require('express');
const router = express.Router();
const { createMensaje, getMensajes, getConversaciones } = require('../controllers/mensajesController');

router.post('/api/mensajes', createMensaje);
router.get('/api/mensajes/:publicacion_id/:user1/:user2', getMensajes);
router.get('/api/conversaciones/:userId', getConversaciones);

module.exports = router;
