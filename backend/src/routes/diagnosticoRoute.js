const express = require('express');
const router = express.Router();
const { diagnosticoIA } = require('../controllers/diagnosticoController');

router.post('/api/diagnostico-ia', diagnosticoIA);

module.exports = router;
