// chatbotRoute.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/api/chatbot', async (req, res) => {
  const { mensaje } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(mensaje);
    const respuesta = result.response.text();

    res.json({ respuesta });
  } catch (error) {
    console.error("Error con Gemini:", error);
    res.status(500).json({ error: 'Error al generar respuesta con Gemini' });
  }
});

module.exports = router;
