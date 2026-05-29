const express = require('express');
const router = express.Router();
const { getUsuarios, updateUsuario, deleteUsuario } = require('../controllers/usuariosController');

router.get('/api/usuarios', getUsuarios);
router.patch('/api/usuarios/:id', updateUsuario);
router.delete('/api/usuarios/:id', deleteUsuario);

module.exports = router;
