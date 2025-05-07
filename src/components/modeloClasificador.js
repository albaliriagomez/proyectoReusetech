import * as tf from '@tensorflow/tfjs';

/**
 * Crea y carga el modelo de TensorFlow.js
 * @returns {Promise<tf.LayersModel>} Modelo cargado
 */
export const crearModelo = async () => {
  try {
    // Intenta cargar el modelo desde la carpeta "model_output"
    console.log("Intentando cargar el modelo desde ./model/model.json");
    const modelo = await tf.loadLayersModel('./model/model.json');
    
    // Compilar el modelo después de cargarlo
    modelo.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    console.log("Modelo cargado exitosamente");
    return modelo;
  } catch (error) {
    console.error("Error al cargar el modelo desde la ruta especificada:", error);
    
    // Si falla, crear un modelo simple temporal para demostración
    console.log("Creando modelo temporal para demostración...");
    const modeloTemp = tf.sequential();
    modeloTemp.add(tf.layers.conv2d({
      inputShape: [224, 224, 3],
      filters: 16,
      kernelSize: 3,
      activation: 'relu'
    }));
    modeloTemp.add(tf.layers.maxPooling2d({poolSize: 2}));
    modeloTemp.add(tf.layers.flatten());
    modeloTemp.add(tf.layers.dense({units: 128, activation: 'relu'}));
    modeloTemp.add(tf.layers.dense({units: 5, activation: 'softmax'})); // 5 categorías de dispositivos
    
    modeloTemp.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    console.log("Modelo temporal creado exitosamente");
    return modeloTemp;
  }
};

/**
 * Preprocesa una imagen para alimentar al modelo
 * @param {HTMLImageElement} imagen - Elemento de imagen a procesar
 * @returns {tf.Tensor} Tensor procesado listo para predicción
 */
const preprocesarImagen = (imagen) => {
  // Crear un tensor a partir de la imagen
  const imagenTensor = tf.browser.fromPixels(imagen);
  
  // Redimensionar a 224x224 (tamaño común para modelos de clasificación de imágenes)
  const redimensionada = tf.image.resizeBilinear(imagenTensor, [224, 224]);
  
  // Normalizar valores a [0,1]
  const normalizada = redimensionada.div(255.0);
  
  // Agregar dimensión de lote (batch)
  const lote = normalizada.expandDims(0);
  
  return lote;
};

/**
 * Realiza la predicción del tipo de dispositivo
 * @param {tf.LayersModel} modelo - Modelo cargado
 * @param {HTMLImageElement} imagen - Elemento de imagen a analizar
 * @returns {Object} Resultado de la predicción
 */
export const predecirDispositivo = async (modelo, imagen) => {
  // En caso de no tener modelo, devolver datos de ejemplo
  if (!modelo) {
    console.warn("No hay modelo disponible, devolviendo datos de ejemplo");
    return {
      categoria: "smartphone",
      marca: "Samsung",
      modelo: "Galaxy S21",
      confianza: 0.85
    };
  }
  
  try {
    // Procesar la imagen
    const tensorImagen = preprocesarImagen(imagen);
    
    // Obtener predicción
    const prediccion = await modelo.predict(tensorImagen);
    const valores = await prediccion.data();
    
    // Liberar memoria
    tensorImagen.dispose();
    prediccion.dispose();
    
    // Encontrar la clase con mayor probabilidad
    const indiceMaximo = valores.indexOf(Math.max(...valores));
    const confianza = valores[indiceMaximo];
    
    // Mapear índice a categoría de dispositivo
    const categorias = ["smartphone", "laptop", "tablet", "smartwatch", "desktop"];
    const categoria = categorias[indiceMaximo];
    
    // Datos de dispositivos de ejemplo por categoría
    const dispositivosPorCategoria = {
      smartphone: { marca: "Samsung", modelo: "Galaxy S21" },
      laptop: { marca: "Dell", modelo: "XPS 13" },
      tablet: { marca: "Apple", modelo: "iPad Pro" },
      smartwatch: { marca: "Apple", modelo: "Watch Series 7" },
      desktop: { marca: "HP", modelo: "Pavilion" }
    };
    
    return {
      categoria,
      marca: dispositivosPorCategoria[categoria].marca,
      modelo: dispositivosPorCategoria[categoria].modelo,
      confianza
    };
  } catch (error) {
    console.error("Error al realizar la predicción:", error);
    return {
      categoria: "smartphone", // Valor predeterminado
      marca: "Desconocido",
      modelo: "Desconocido",
      confianza: 0
    };
  }
};

/**
 * Evalúa el estado visual del dispositivo analizando la imagen
 * @param {HTMLImageElement} imagen - Elemento de imagen a analizar
 * @returns {Object} Evaluación del estado físico
 */
export const evaluarEstadoVisual = (imagen) => {
  // En un escenario real, aquí se implementaría un análisis de la imagen
  // para detectar daños, arañazos, etc.
  
  // Para esta demostración, devolvemos un estado aleatorio con tendencia a buen estado
  const estadoAleatorio = Math.floor(Math.random() * 30) + 70; // Entre 70% y 100%
  
  let descripcion;
  if (estadoAleatorio > 90) {
    descripcion = "El dispositivo se encuentra en excelente estado, prácticamente como nuevo.";
  } else if (estadoAleatorio > 80) {
    descripcion = "El dispositivo se encuentra en muy buen estado con mínimos signos de uso.";
  } else if (estadoAleatorio > 70) {
    descripcion = "El dispositivo presenta signos moderados de uso pero mantiene buena funcionalidad.";
  } else {
    descripcion = "El dispositivo muestra desgaste visible y podría requerir mantenimiento.";
  }
  
  return {
    porcentaje: estadoAleatorio,
    descripcion
  };
};

/**
 * Genera un diagnóstico completo basado en el tipo de dispositivo y el estado visual
 * @param {string} tipoDispositivo - Tipo de dispositivo detectado
 * @param {Object} estadoVisual - Resultado de la evaluación visual
 * @returns {Object} Diagnóstico completo
 */
export const generarDiagnostico = (tipoDispositivo, estadoVisual) => {
  // Nombres completos de dispositivos según categoría
  const nombresDispositivos = {
    smartphone: "Samsung Galaxy S21",
    laptop: "Dell XPS 13",
    tablet: "Apple iPad Pro",
    smartwatch: "Apple Watch Series 7",
    desktop: "HP Pavilion Desktop"
  };
  
  // Marcas según categoría
  const marcasPorCategoria = {
    smartphone: "Samsung",
    laptop: "Dell",
    tablet: "Apple",
    smartwatch: "Apple",
    desktop: "HP"
  };
  
  // Modelos según categoría
  const modelosPorCategoria = {
    smartphone: "Galaxy S21",
    laptop: "XPS 13",
    tablet: "iPad Pro",
    smartwatch: "Watch Series 7",
    desktop: "Pavilion"
  };
  
  // Determinar recomendación basada en el estado
  let recomendacion, diagnosticoTexto;
  
  if (estadoVisual.porcentaje > 85) {
    recomendacion = "Donar";
    diagnosticoTexto = `Este ${tipoDispositivo} ${nombresDispositivos[tipoDispositivo]} se encuentra en excelente estado. No parece necesitar reparaciones y podría ser muy útil para otra persona.`;
  } else if (estadoVisual.porcentaje > 70) {
    recomendacion = "Reparar";
    diagnosticoTexto = `Este ${tipoDispositivo} ${nombresDispositivos[tipoDispositivo]} se encuentra en buen estado general pero podría beneficiarse de algunas reparaciones menores para extender su vida útil.`;
  } else {
    recomendacion = "Reciclar";
    diagnosticoTexto = `Este ${tipoDispositivo} ${nombresDispositivos[tipoDispositivo]} muestra signos significativos de desgaste. La mejor opción podría ser reciclarlo responsablemente.`;
  }
  
  // Generar sugerencias adaptadas
  const sugerencias = [
    {
      tipo: "reparacion",
      titulo: "Reparación recomendada",
      descripcion: `Este ${tipoDispositivo} podría ser reparado para extender su vida útil. Recomendamos llevarlo a un técnico especializado para un diagnóstico detallado.`
    },
    {
      tipo: "donacion",
      titulo: "Considere donar el dispositivo",
      descripcion: `Este ${tipoDispositivo} aún puede ser útil para alguien más. Muchas organizaciones benéficas aceptan donaciones de dispositivos electrónicos usados para personas que los necesitan.`
    },
    {
      tipo: "reciclaje",
      titulo: "Opción de reciclaje responsable",
      descripcion: `Si decide no reparar o donar el dispositivo, por favor considere llevarlo a un centro de reciclaje electrónico especializado para evitar la contaminación ambiental.`
    }
  ];
  
  return {
    nombre: nombresDispositivos[tipoDispositivo],
    tipo: tipoDispositivo,
    marca: marcasPorCategoria[tipoDispositivo],
    modelo: modelosPorCategoria[tipoDispositivo],
    estadoFisico: estadoVisual,
    diagnostico: diagnosticoTexto,
    recomendacion,
    sugerencias
  };
};