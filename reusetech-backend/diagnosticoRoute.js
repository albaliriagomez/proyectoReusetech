// reusetech-backend/diagnosticoRoute.js
const express = require('express'); 
const router = express.Router();
const fetch = require('node-fetch'); // Asegúrate de tener node-fetch instalado

router.post('/api/diagnostico-ia', async (req, res) => {
  const { respuestas, dispositivo } = req.body;

  try {
    // Llamar al servicio ML de Python
    const response = await fetch('http://localhost:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enciende: respuestas.enciende,
        estadoFisico: respuestas.estadoFisico,
        bateria: respuestas.bateria,
        antiguedad: respuestas.antiguedad,
        dispositivo: dispositivo
      })
    });

    if (!response.ok) {
      throw new Error('Error en el servicio ML');
    }

    const resultado = await response.json();
    res.json(resultado);

  } catch (error) { 
    console.error('Error en diagnóstico ML:', error);
    res.status(500).json({ error: "Fallo en el servicio de diagnóstico ML." }); 
  }
});

module.exports = router;