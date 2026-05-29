const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");
const sharp = require("sharp");


const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// Cargar el modelo TensorFlow
let model

async function loadModel() {
  try {
    // Cargar el modelo MobileNet preentrenado
    model = await tf.loadLayersModel("https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json")
    console.log("Modelo TensorFlow cargado correctamente")
  } catch (error) {
    console.error("Error al cargar el modelo:", error)
  }
}

// Cargar el modelo al iniciar el servidor
loadModel()

// Función para preprocesar la imagen
async function preprocessImage(imagePath) {
  // Redimensionar la imagen a 224x224 (tamaño esperado por MobileNet)
  const imageBuffer = await sharp(imagePath).resize(224, 224).toBuffer()

  // Convertir la imagen a un tensor
  const tensor = tf.node.decodeImage(imageBuffer, 3)

  // Expandir dimensiones para que coincida con la entrada esperada [1, 224, 224, 3]
  const expanded = tensor.expandDims(0)

  // Normalizar valores de píxeles a [-1, 1]
  const normalized = expanded.toFloat().div(tf.scalar(127)).sub(tf.scalar(1))

  return normalized
}

// Función para clasificar la imagen
async function classifyImage(imagePath) {
  try {
    // Preprocesar la imagen
    const tensor = await preprocessImage(imagePath)

    // Realizar la predicción
    const predictions = await model.predict(tensor)
    const data = await predictions.data()

    // Liberar memoria
    tensor.dispose()
    predictions.dispose()

    // Obtener las 5 mejores predicciones
    const topPredictions = Array.from(data)
      .map((probability, index) => ({ probability, index }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5)

    // Mapear índices a clases de dispositivos
    // Nota: MobileNet está entrenado en ImageNet, así que adaptamos las clases
    const deviceClasses = [
      { index: 654, name: "smartphone", label: "Teléfono móvil" },
      { index: 527, name: "laptop", label: "Laptop" },
      { index: 782, name: "tablet", label: "Tablet" },
      { index: 664, name: "monitor", label: "Monitor" },
      { index: 742, name: "teclado", label: "Teclado" },
      { index: 713, name: "mouse", label: "Mouse" },
    ]

    // Intentar identificar el tipo de dispositivo
    let deviceType = "desconocido"
    let deviceBrand = ""
    let deviceModel = ""
    let confidence = 0

    for (const pred of topPredictions) {
      const matchedDevice = deviceClasses.find((d) => Math.abs(d.index - pred.index) < 10)
      if (matchedDevice) {
        deviceType = matchedDevice.name
        confidence = pred.probability
        break
      }
    }

    // Análisis visual para estimar el estado físico
    // En un sistema real, esto requeriría un modelo específico
    const estadoFisico = {
      porcentaje: Math.floor(Math.random() * 30) + 70, // Simulación entre 70-100%
      descripcion: "El dispositivo parece estar en buen estado basado en el análisis visual.",
    }

    // Determinar marca y modelo basado en características visuales
    // Esto es una simulación - en un sistema real se usaría un modelo específico
    if (deviceType === "smartphone") {
      const marcas = ["Samsung", "Apple", "Xiaomi", "Huawei"]
      deviceBrand = marcas[Math.floor(Math.random() * marcas.length)]

      if (deviceBrand === "Samsung") {
        const modelos = ["Galaxy S21", "Galaxy S22", "Galaxy A52"]
        deviceModel = modelos[Math.floor(Math.random() * modelos.length)]
      } else if (deviceBrand === "Apple") {
        const modelos = ["iPhone 12", "iPhone 13", "iPhone 14"]
        deviceModel = modelos[Math.floor(Math.random() * modelos.length)]
      }
    } else if (deviceType === "laptop") {
      const marcas = ["Dell", "HP", "Lenovo", "Apple"]
      deviceBrand = marcas[Math.floor(Math.random() * marcas.length)]

      if (deviceBrand === "Apple") {
        deviceModel = "MacBook Pro"
      } else {
        const modelos = ["XPS 13", "ThinkPad X1", "Spectre x360"]
        deviceModel = modelos[Math.floor(Math.random() * modelos.length)]
      }
    }

    // Determinar recomendación basada en el estado físico
    let recomendacion = ""
    if (estadoFisico.porcentaje > 80) {
      recomendacion = "Donar"
    } else if (estadoFisico.porcentaje > 50) {
      recomendacion = "Reparar"
    } else {
      recomendacion = "Reciclar"
    }

    // Generar sugerencias basadas en la recomendación
    const sugerencias = []

    if (recomendacion === "Reparar" || estadoFisico.porcentaje < 90) {
      sugerencias.push({
        tipo: "reparacion",
        titulo: "Reparación recomendada",
        descripcion: `Este ${deviceType} ${deviceBrand} ${deviceModel} podría ser reparado para extender su vida útil. Recomendamos llevarlo a un técnico especializado para un diagnóstico detallado.`,
      })
    }

    if (estadoFisico.porcentaje > 60) {
      sugerencias.push({
        tipo: "donacion",
        titulo: "Considere donar el dispositivo",
        descripcion: `Este ${deviceType} aún puede ser útil para alguien más. Muchas organizaciones benéficas aceptan donaciones de dispositivos electrónicos usados para personas que los necesitan.`,
      })
    }

    sugerencias.push({
      tipo: "reciclaje",
      titulo: "Opción de reciclaje responsable",
      descripcion: `Si decide no reparar o donar el dispositivo, por favor considere llevarlo a un centro de reciclaje electrónico especializado para evitar la contaminación ambiental.`,
    })

    // Construir el resultado final
    const resultado = {
      nombre: `${deviceBrand} ${deviceModel}`,
      tipo: deviceType,
      marca: deviceBrand,
      modelo: deviceModel,
      estadoFisico: estadoFisico,
      diagnostico: `Este ${deviceType} ${deviceBrand} ${deviceModel} se encuentra en ${estadoFisico.porcentaje > 70 ? "buen" : "regular"} estado. ${estadoFisico.porcentaje > 70 ? "No parece necesitar reparaciones urgentes." : "Podría necesitar algunas reparaciones."}`,
      recomendacion: recomendacion,
      sugerencias: sugerencias,
      confianza: confidence,
    }

    return resultado
  } catch (error) {
    console.error("Error al clasificar la imagen:", error)
    throw error
  }
}

// Ruta para analizar la imagen
app.post("/api/diagnostico/analizar", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ninguna imagen" })
    }

    console.log("Imagen recibida:", req.file.path)

    // Verificar si el modelo está cargado
    if (!model) {
      console.log("Esperando a que el modelo se cargue...")
      await loadModel()
    }

    // Clasificar la imagen
    const resultado = await classifyImage(req.file.path)

    res.json(resultado)
  } catch (error) {
    console.error("Error al procesar la imagen:", error)
    res.status(500).json({ error: "Error al procesar la imagen" })
  }
})

// Servir imágenes almacenadas en "uploads"
app.use("/uploads", express.static("uploads"))

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`)
})
