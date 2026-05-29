const express = require('express');
const router = express.Router();
const { createComentario, getComentarios } = require('../controllers/comentariosController');

router.post('/api/comentarios', createComentario);
router.get('/api/comentarios/:publicacion_id', getComentarios);

module.exports = router;
