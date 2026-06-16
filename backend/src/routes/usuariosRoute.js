const express = require('express');
const router = express.Router();
const { getUsuarios, updateUsuario, deleteUsuario, getUsuarioById } = require('../controllers/usuariosController');

router.get('/api/usuarios', getUsuarios);
router.get('/api/usuarios/:id', getUsuarioById);
router.patch('/api/usuarios/:id', updateUsuario);
router.delete('/api/usuarios/:id', deleteUsuario);

module.exports = router;
