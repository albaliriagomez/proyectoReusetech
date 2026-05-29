// VERSIÓN MOCK v2 - Con checklist, sugerencias de fotos y recomendaciones accionables
'use strict';

const multer = require('multer');
const sharp  = require('sharp');

const upload = multer({ storage: multer.memoryStorage() });

// ─── Información de componentes ────────────────────────────────
const INFO_COMPONENTES = {
  'Pantalla_Laptop':  { nombre: 'Pantalla',        tipo: 'laptop',  esencial: true,  detalle: 'Pantalla principal del equipo' },
  'Teclado':          { nombre: 'Teclado',         tipo: 'laptop',  esencial: true,  detalle: 'Teclado integrado' },
  'Touchpad':         { nombre: 'Touchpad',        tipo: 'laptop',  esencial: false, detalle: 'Panel táctil' },
  'Camara_Laptop':    { nombre: 'Cámara web',      tipo: 'laptop',  esencial: false, detalle: 'Cámara frontal' },
  'Bisagra':          { nombre: 'Bisagra',         tipo: 'laptop',  esencial: true,  detalle: 'Mecanismo de apertura' },
  'Pantalla_Celular': { nombre: 'Pantalla',        tipo: 'celular', esencial: true,  detalle: 'Display del celular' },
  'Camara_Celular':   { nombre: 'Cámara',          tipo: 'celular', esencial: false, detalle: 'Cámara del celular' },
  'Boton_Celular':    { nombre: 'Botón físico',    tipo: 'celular', esencial: false, detalle: 'Botones laterales o frontales' },
  'Puerto_Carga':     { nombre: 'Puerto de carga', tipo: 'celular', esencial: true,  detalle: 'Conector de carga' },
};

const COMPONENTES_LAPTOP  = ['Pantalla_Laptop', 'Teclado', 'Touchpad', 'Camara_Laptop', 'Bisagra'];
const COMPONENTES_CELULAR = ['Pantalla_Celular', 'Camara_Celular', 'Boton_Celular', 'Puerto_Carga'];

// ─── Sugerencias de fotos adicionales por dispositivo ────────────
const SUGERENCIAS_FOTOS = {
  laptop: [
    { icono: '📷', texto: 'Toma una foto LATERAL para mostrar los puertos USB y HDMI' },
    { icono: '📷', texto: 'Toma una foto del TECLADO en detalle' },
    { icono: '📷', texto: 'Toma una foto del LOGO/MARCA del equipo' },
    { icono: '📷', texto: 'Toma una foto con la laptop CERRADA para ver la carcasa' },
  ],
  celular: [
    { icono: '📷', texto: 'Toma una foto de la PARTE TRASERA del celular' },
    { icono: '📷', texto: 'Toma una foto del PUERTO DE CARGA en detalle' },
    { icono: '📷', texto: 'Toma una foto de los BOTONES LATERALES' },
    { icono: '📷', texto: 'Toma una foto encendido si funciona' },
  ],
};

// ─── MOCK: Generar detecciones según proporción de imagen ─────────
async function generarDeteccionesMock(buffer) {
  const meta = await sharp(buffer).metadata();
  const ratio = meta.width / meta.height;

  // Detectar tipo de dispositivo según proporción
  // ratio < 0.7 = celular vertical
  // ratio > 1.0 = laptop/horizontal
  // entre 0.7-1.0 = formato cuadrado, asumimos laptop
  const esLaptop = ratio >= 0.85;
  const componentesPosibles = esLaptop ? COMPONENTES_LAPTOP : COMPONENTES_CELULAR;

  // Validación: imagen muy pequeña o rara
  if (meta.width < 200 || meta.height < 200) {
    return { detecciones: [], razon_falla: 'imagen_pequena' };
  }

  // Generar 3-5 detecciones realistas
  const cantidad = 3 + Math.floor(Math.random() * 3);
  const seleccionados = [...componentesPosibles]
    .sort(() => Math.random() - 0.5)
    .slice(0, cantidad);

  const detecciones = seleccionados.map(clase => ({
    class:      clase,
    confidence: 0.65 + Math.random() * 0.30,
  }));

  return { detecciones, meta };
}

// ─── Determinar tipo de dispositivo ──────────────────────────────
function detectarTipoDispositivo(detecciones) {
  let votosLaptop = 0, votosCelular = 0;
  detecciones.forEach(d => {
    const info = INFO_COMPONENTES[d.class];
    if (info?.tipo === 'laptop')  votosLaptop++;
    if (info?.tipo === 'celular') votosCelular++;
  });
  if (votosLaptop > votosCelular)  return 'laptop';
  if (votosCelular > votosLaptop) return 'celular';
  return 'desconocido';
}

// ─── Generar CHECKLIST visual: esperados vs detectados ───────────
function generarChecklist(detecciones, tipo) {
  const esperados = tipo === 'laptop'  ? COMPONENTES_LAPTOP
                  : tipo === 'celular' ? COMPONENTES_CELULAR : [];

  const detectadosSet = new Set(detecciones.map(d => d.class));

  return esperados.map(clase => {
    const info      = INFO_COMPONENTES[clase];
    const detectado = detectadosSet.has(clase);
    const deteccion = detecciones.find(d => d.class === clase);

    return {
      clase,
      nombre:    info.nombre,
      esencial:  info.esencial,
      detectado,
      confianza: deteccion ? `${Math.round(deteccion.confidence * 100)}%` : null,
      mensaje:   detectado
        ? '✓ Visible en la foto'
        : info.esencial
          ? '⚠ No se ve claramente — toma otra foto'
          : 'No visible (opcional)',
    };
  });
}

// ─── Generar RECOMENDACIÓN ACCIONABLE clara ──────────────────────
function generarRecomendacionAccionable(detecciones, tipo, checklist) {
  const esperados    = tipo === 'laptop' ? COMPONENTES_LAPTOP : COMPONENTES_CELULAR;
  const esenciales   = checklist.filter(c => c.esencial);
  const esencialesOK = esenciales.filter(c => c.detectado).length;
  const cobertura    = detecciones.length / esperados.length;

  // Foto no clara (muy pocas detecciones)
  if (detecciones.length < 2) {
    return {
      tipo: 'foto_mala',
      icono: '📷',
      titulo: 'Foto poco clara',
      mensaje: 'No pudimos identificar suficientes componentes en esta foto.',
      accion_principal: {
        texto: 'Toma otra foto',
        descripcion: 'Asegúrate de que haya buena iluminación y el dispositivo se vea completo',
      },
      categoria_sugerida: null,
      estado_sugerido: null,
    };
  }

  // Equipo completo (mayoría de esenciales detectados)
  if (esencialesOK >= esenciales.length - 1 && cobertura >= 0.6) {
    return {
      tipo: 'reutilizacion',
      icono: '✅',
      titulo: '¡Tu equipo se ve completo!',
      mensaje: `Identificamos los componentes principales de tu ${tipo}. Está en condiciones para ser reutilizado por otra persona.`,
      accion_principal: {
        texto: 'Publicar para REUTILIZACIÓN',
        descripcion: 'Tu equipo puede tener una segunda vida útil',
      },
      categoria_sugerida: tipo === 'laptop' ? 'Laptop' : 'Celular',
      estado_sugerido: 'Funcional',
    };
  }

  // Equipo parcial
  if (esencialesOK >= 1) {
    return {
      tipo: 'repuestos',
      icono: '⚠️',
      titulo: 'Equipo parcialmente identificado',
      mensaje: `Vemos algunos componentes principales, pero faltan otros. Si el equipo no funciona completo, te sugerimos publicarlo para que sus piezas sean reutilizadas.`,
      accion_principal: {
        texto: 'Publicar para REPUESTOS',
        descripcion: 'Sus componentes pueden servir a otros usuarios',
      },
      categoria_sugerida: tipo === 'laptop' ? 'Laptop' : 'Celular',
      estado_sugerido: 'Para repuestos',
    };
  }

  // Equipo muy dañado o no identificable
  return {
    tipo: 'reciclaje',
    icono: '♻️',
    titulo: 'Considera el reciclaje responsable',
    mensaje: 'No identificamos suficientes componentes principales. Si el equipo no funciona, llévalo a un punto de reciclaje electrónico.',
    accion_principal: {
      texto: 'Publicar para RECICLAJE',
      descripcion: 'Evita que termine en un basurero',
    },
    categoria_sugerida: tipo === 'laptop' ? 'Laptop' : 'Celular',
    estado_sugerido: 'Para reciclaje',
  };
}

// ─── Sugerencias de fotos adicionales ───────────────────────────
function generarSugerenciasFotos(tipo, checklist) {
  if (tipo === 'desconocido') return [];

  const sugerencias = [...(SUGERENCIAS_FOTOS[tipo] || [])];

  // Agregar sugerencias específicas de componentes faltantes
  const faltantesEsenciales = checklist.filter(c => c.esencial && !c.detectado);
  faltantesEsenciales.forEach(c => {
    sugerencias.unshift({
      icono: '⚠️',
      texto: `Toma una foto donde se vea claramente: ${c.nombre}`,
      prioritaria: true,
    });
  });

  return sugerencias.slice(0, 4); // máximo 4 sugerencias
}

// ─── Handler principal ──────────────────────────────────────────────
const analizarHardware = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { detecciones, razon_falla } = await generarDeteccionesMock(req.file.buffer);

    if (razon_falla === 'imagen_pequena') {
      return res.json({
        exito: false,
        mensaje: 'La imagen es muy pequeña o de baja calidad.',
        sugerencia: 'Sube una foto de mayor resolución.',
      });
    }

    if (detecciones.length === 0) {
      return res.json({
        exito: false,
        mensaje: 'No se detectaron componentes reconocibles.',
        sugerencia: 'Sube una foto clara de una laptop o celular completo.',
      });
    }

    const tipo             = detectarTipoDispositivo(detecciones);
    const checklist        = generarChecklist(detecciones, tipo);
    const recomendacion    = generarRecomendacionAccionable(detecciones, tipo, checklist);
    const sugerenciasFotos = generarSugerenciasFotos(tipo, checklist);

    // Lista de componentes detectados (para mostrar)
    const componentes = detecciones
      .sort((a, b) => b.confidence - a.confidence)
      .map(d => {
        const info = INFO_COMPONENTES[d.class] || {};
        return {
          clase_modelo:  d.class,
          nombre:        info.nombre || d.class,
          esencial:      info.esencial || false,
          confianza:     `${Math.round(d.confidence * 100)}%`,
          confianza_num: d.confidence,
          detalle:       info.detalle || 'Componente detectado',
        };
      });

    res.json({
      exito: true,
      tipo_dispositivo: tipo,
      total_componentes: componentes.length,
      componentes,
      checklist,                           // ← componentes esperados vs detectados
      recomendacion,                       // ← acción clara con categoría/estado sugerido
      sugerencias_fotos: sugerenciasFotos, // ← qué fotos adicionales tomar
      modo_demo: true,
      nota: '⚠️  MODO DEMO: Resultados simulados. Pendiente entrenar modelo real.',
    });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Error al procesar la imagen.', details: err.message });
  }
};

module.exports = { upload, analizarHardware };
