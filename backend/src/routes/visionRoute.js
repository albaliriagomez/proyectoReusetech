const express = require('express');
const router = express.Router();
const { upload, analizarHardware } = require('../controllers/visionController');

router.post('/api/analizar-hardware', upload.single('image'), analizarHardware);

module.exports = router;
