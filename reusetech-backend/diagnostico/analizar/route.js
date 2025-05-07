// modeloClasificador.js
import * as tf from '@tensorflow/tfjs';

// Categorías de dispositivos
const CATEGORIAS = ['smartphone', 'laptop', 'tablet', 'smartwatch', 'desktop'];

// Función para crear el modelo de clasificación
export async function crearModelo() {
  // Crear un modelo secuencial
  const modelo = tf.sequential();
  
  // Capa de entrada - normaliza los valores de píxeles
  modelo.add(tf.layers.rescaling({
    scale: 1/255,
    inputShape: [224, 224, 3]
  }));
  
  // Capas convolucionales
  modelo.add(tf.layers.conv2d({
    filters: 32,
    kernelSize: 3,
    padding: 'same',
    activation: 'relu'
  }));
  modelo.add(tf.layers.maxPooling2d({poolSize: 2}));
  
  modelo.add(tf.layers.conv2d({
    filters: 64,
    kernelSize: 3,
    padding: 'same',
    activation: 'relu'
  }));
  modelo.add(tf.layers.maxPooling2d({poolSize: 2}));
  
  modelo.add(tf.layers.conv2d({
    filters: 128,
    kernelSize: 3,
    padding: 'same',
    activation: 'relu'
  }));
  modelo.add(tf.layers.maxPooling2d({poolSize: 2}));
  
  // Aplanar para las capas densas
  modelo.add(tf.layers.flatten());
  
  // Capas densas
  modelo.add(tf.layers.dense({units: 128, activation: 'relu'}));
  modelo.add(tf.layers.dropout({rate: 0.5})); // Prevenir overfitting
  modelo.add(tf.layers.dense({units: CATEGORIAS.length, activation: 'softmax'}));
  
  // Compilar el modelo
  modelo.compile({
    optimizer: 'adam',
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  return modelo;
}

// Función para predecir el tipo de dispositivo a partir de una imagen
export async function predecirDispositivo(modelo, imagenElement) {
  // Convertir la imagen a un tensor
  const imagen = tf.browser.fromPixels(imagenElement)
    .resizeBilinear([224, 224])
    .expandDims(0);
  
  // Realizar predicción
  const prediccion = await modelo.predict(imagen);
  
  // Obtener el índice de la categoría con mayor probabilidad
  const indiceCategoria = prediccion.argMax(1).dataSync()[0];
  
  // Obtener las probabilidades para todas las categorías
  const probabilidades = await prediccion.data();
  
  // Liberar memoria del tensor
  tf.dispose([imagen, prediccion]);
  
  // Devolver el resultado
  return {
    categoria: CATEGORIAS[indiceCategoria],
    probabilidad: probabilidades[indiceCategoria],
    todasProbabilidades: Array.from(probabilidades).map((prob, idx) => ({
      categoria: CATEGORIAS[idx],
      probabilidad: prob
    }))
  };
}

// Función para generar un diagnóstico basado en la categoría y el aspecto visual
export function generarDiagnostico(categoria, estadoVisual) {
  // Datos ejemplo para diferentes tipos de dispositivos
  const marcasPorCategoria = {
    smartphone: ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Google'],
    laptop: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus'],
    tablet: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Huawei'],
    smartwatch: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Xiaomi'],
    desktop: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus']
  };
  
  const modelosPorMarca = {
    Samsung: ['Galaxy S21', 'Galaxy A52', 'Galaxy Note 20', 'Galaxy Tab S7'],
    Apple: ['iPhone 13', 'MacBook Pro', 'iPad Pro', 'Apple Watch Series 7'],
    Xiaomi: ['Mi 11', 'Redmi Note 10', 'Mi Watch'],
    Huawei: ['P40 Pro', 'MateBook X Pro', 'MatePad Pro'],
    Google: ['Pixel 6', 'Pixel 5a'],
    Dell: ['XPS 13', 'Inspiron 15', 'Precision Tower'],
    HP: ['Spectre x360', 'Pavilion', 'EliteDesk'],
    Lenovo: ['ThinkPad X1', 'Yoga', 'IdeaPad', 'ThinkCentre'],
    Asus: ['ZenBook', 'ROG', 'VivoBook'],
    Microsoft: ['Surface Pro', 'Surface Laptop'],
    Garmin: ['Forerunner', 'Venu', 'Fenix'],
    Fitbit: ['Versa', 'Sense', 'Charge']
  };
  
  // Seleccionar una marca aleatoria para la categoría
  const marcasDisponibles = marcasPorCategoria[categoria] || ['Genérica'];
  const marcaSeleccionada = marcasDisponibles[Math.floor(Math.random() * marcasDisponibles.length)];
  
  // Seleccionar un modelo aleatorio para la marca
  const modelosDisponibles = modelosPorMarca[marcaSeleccionada] || ['Modelo desconocido'];
  const modeloSeleccionado = modelosDisponibles[Math.floor(Math.random() * modelosDisponibles.length)];
  
  // Nombre completo del dispositivo
  const nombreDispositivo = `${marcaSeleccionada} ${modeloSeleccionado}`;
  
  // Valorar el estado físico (0-100)
  const estadoFisico = {
    porcentaje: Math.floor(estadoVisual * 100),
    descripcion: estadoVisual > 0.8 
      ? "El dispositivo se encuentra en excelente estado, con mínimos signos de uso."
      : estadoVisual > 0.6
      ? "El dispositivo se encuentra en buen estado general con algunos signos de uso."
      : estadoVisual > 0.4
      ? "El dispositivo muestra signos moderados de desgaste y podría necesitar mantenimiento."
      : estadoVisual > 0.2
      ? "El dispositivo muestra un desgaste significativo y probablemente requiera reparaciones."
      : "El dispositivo se encuentra en mal estado y necesita reparaciones importantes."
  };
  
  // Generar diagnóstico basado en el estado físico
  let diagnostico, recomendacion;
  
  if (estadoVisual > 0.7) {
    diagnostico = `Este ${categoria} ${marcaSeleccionada} ${modeloSeleccionado} se encuentra en buen estado. No parece necesitar reparaciones urgentes y podría seguir funcionando correctamente por un tiempo.`;
    recomendacion = "Donar";
  } else if (estadoVisual > 0.4) {
    diagnostico = `Este ${categoria} ${marcaSeleccionada} ${modeloSeleccionado} muestra signos de uso moderado. Podría beneficiarse de un mantenimiento preventivo para extender su vida útil.`;
    recomendacion = "Reparar";
  } else {
    diagnostico = `Este ${categoria} ${marcaSeleccionada} ${modeloSeleccionado} muestra signos significativos de desgaste. Recomendamos evaluar si una reparación es viable o si es mejor considerar el reciclaje responsable.`;
    recomendacion = "Reciclar";
  }
  
  // Generar sugerencias
  const sugerencias = [
    {
      tipo: "reparacion",
      titulo: "Reparación recomendada",
      descripcion: `Este ${categoria} ${marcaSeleccionada} podría ser reparado para extender su vida útil. Recomendamos llevarlo a un técnico especializado para un diagnóstico detallado.`
    },
    {
      tipo: "donacion",
      titulo: "Considere donar el dispositivo",
      descripcion: `Este ${categoria} aún puede ser útil para alguien más. Muchas organizaciones benéficas aceptan donaciones de dispositivos electrónicos usados para personas que los necesitan.`
    },
    {
      tipo: "reciclaje",
      titulo: "Opción de reciclaje responsable",
      descripcion: `Si decide no reparar o donar el dispositivo, por favor considere llevarlo a un centro de reciclaje electrónico especializado para evitar la contaminación ambiental.`
    }
  ];
  
  // Devolver el resultado completo
  return {
    nombre: nombreDispositivo,
    tipo: categoria,
    marca: marcaSeleccionada,
    modelo: modeloSeleccionado,
    estadoFisico,
    diagnostico,
    recomendacion,
    sugerencias
  };
}

// Evaluar el estado visual de la imagen (función simulada)
export function evaluarEstadoVisual(imagenElement) {
  // En un caso real, esto utilizaría otro modelo para evaluar rayones, daños, etc.
  // Por ahora, devolvemos un valor aleatorio entre 0.3 y 1.0
  return 0.3 + Math.random() * 0.7;
}