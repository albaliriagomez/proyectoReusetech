import * as tf from "@tensorflow/tfjs"

// Clase para manejar las operaciones con TensorFlow en el navegador
export class TensorFlowManager {
  private modelUrl: string
  private model: tf.LayersModel | null = null

  constructor(modelUrl = "/models/modelo_dispositivos/model.json") {
    // En el navegador, usamos una URL relativa en lugar de una ruta de archivo
    this.modelUrl = modelUrl
  }

  // Cargar el modelo
  async loadModel(): Promise<tf.LayersModel> {
    if (!this.model) {
      try {
        // Cargar el modelo desde una URL
        this.model = await tf.loadLayersModel(this.modelUrl)
        console.log("Modelo cargado correctamente")
      } catch (error) {
        console.error("Error al cargar el modelo:", error)
        throw new Error("No se pudo cargar el modelo")
      }
    }
    return this.model
  }

  // Preprocesar una imagen para el modelo
  async preprocessImage(imageElement: HTMLImageElement): Promise<tf.Tensor> {
    return tf.tidy(() => {
      // Convertir la imagen HTML a tensor
      const tensor = tf.browser.fromPixels(imageElement)
      
      // Redimensionar a 224x224 (tamaño esperado por el modelo)
      const resized = tf.image.resizeBilinear(tensor, [224, 224])
      
      // Normalizar los valores de píxeles a [0,1]
      const normalized = resized.div(tf.scalar(255))
      
      // Expandir dimensiones para el batch
      return normalized.expandDims(0)
    })
  }

  // Hacer una predicción
  async predict(tensor: tf.Tensor): Promise<number[]> {
    const model = await this.loadModel()
    const prediction = model.predict(tensor) as tf.Tensor
    const probabilities = await prediction.data()

    // Liberar memoria
    prediction.dispose()

    return Array.from(probabilities)
  }
}
