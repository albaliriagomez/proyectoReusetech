const chatbot = async (req, res) => {
  const { mensaje } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // Usamos el nombre EXACTO que apareció en tu lista
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: mensaje }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Respuesta exitosa
    const respuestaTexto = data.candidates[0].content.parts[0].text;
    res.json({ respuesta: respuestaTexto });

  } catch (error) {
    console.error("Error con el modelo nuevo:", error.message);
    res.status(500).json({ error: "La IA de ReUseTech está procesando mucha información. Intenta de nuevo." });
  }
};

module.exports = { chatbot };
