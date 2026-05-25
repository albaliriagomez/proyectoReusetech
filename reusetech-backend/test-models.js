require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Probamos con el modelo Pro que tiene soporte de visión garantizado
    console.log("--- Intentando con Gemini Pro Vision ---");
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" }); 
    
    // Opcional: Si el de arriba falla, prueba con "gemini-1.5-pro-latest"
    
    const result = await model.generateContent("Dime hola");
    console.log("✅ ¡CONECTADO!: ", result.response.text());
  } catch (error) {
    console.error("❌ Error con este modelo:", error.message);
  }
}

listModels();