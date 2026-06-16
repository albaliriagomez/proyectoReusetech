const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../config/db');
const { registrarEvento } = require('../config/influx');

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ── Cálculo de impacto ambiental ──────────────────────────────────────────────
const CO2_BASE = {
  'Computadoras y Accesorios': 320,
  'Teléfonos y Accesorios':     65,
  'Otros':                       50,
};

const FACTOR_ESTADO = {
  'Buen estado': 1.0,
  'Usado':       0.7,
  'Reciclaje':   0.4,
};

const PUNTOS_ESTADO = {
  'Buen estado': 90,
  'Usado':       60,
  'Reciclaje':   30,
};

const MAPA_ESTADOS_IA = {
  'PARA DONAR': 'Buen estado',
  'PARA REPARAR': 'Usado',
  'PARA REPUESTOS': 'Reciclaje',
  'PARA RECICLAR': 'Reciclaje',
};

function calcularImpacto(categoria, estado) {
  // Homologar el estado de manera defensiva en caso de que venga en formato crudo de la IA
  const estadoHomologado = MAPA_ESTADOS_IA[estado] || estado;

  const co2Base            = CO2_BASE[categoria]    ?? 50;
  const factor             = FACTOR_ESTADO[estadoHomologado]  ?? 0.7;
  const co2_evitado        = Math.round(co2Base * factor);
  const puntos_reutilizacion = PUNTOS_ESTADO[estadoHomologado] ?? 60;
  const arboles_equivalentes = Math.round(co2_evitado / 20);
  return { co2_evitado, puntos_reutilizacion, arboles_equivalentes };
}

function enriquecerConImpacto(row) {
  return { ...row, impacto_ambiental: calcularImpacto(row.categoria, row.estado) };
}
// ─────────────────────────────────────────────────────────────────────────────

const createPublicacion = async (req, res) => {
  try {
    const { titulo, nombredeldispositivo, marcaoModelo, categoria, descripcion, contacto, ubicacion, autor_id, verificacion_id } = req.body;
    const foto = req.file ? req.file.filename : null;

    // Validar verificacion_id
    if (!verificacion_id) {
      return res.status(400).json({ message: 'Se requiere una verificación de salud por IA válida para publicar.' });
    }

    const verifResult = await pool.query(
      'SELECT estado_calculado FROM verificaciones_salud WHERE id = $1',
      [verificacion_id]
    );

    if (verifResult.rows.length === 0) {
      return res.status(400).json({ message: 'La verificación de salud especificada no existe en la base de datos.' });
    }

    const estadoReal = verifResult.rows[0].estado_calculado;

    const query = `
    INSERT INTO publicaciones (titulo, nombredeldispositivo, marcaoModelo, categoria, estado, descripcion, contacto, ubicacion, foto, autor_id, verificacion_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;

    const values = [titulo, nombredeldispositivo, marcaoModelo, categoria, estadoReal, descripcion, contacto, ubicacion, foto, autor_id, verificacion_id];

    const result = await pool.query(query, values);

    // 📊 InfluxDB → alimenta gráficas de Categorías, Ubicaciones y Tendencia en Grafana
    registrarEvento(
      'nueva_publicacion',
      {
        categoria: categoria || 'sin_categoria',
        ubicacion: ubicacion || 'sin_ubicacion',
        estado:    estadoReal || 'sin_estado',
      },
      { count: 1 }
    );

    const publicacion = enriquecerConImpacto(result.rows[0]);
    res.status(201).json({ message: 'Publicación creada con éxito', data: publicacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar en la base de datos' });
  }
};

const updatePublicacion = async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE publicaciones SET visible = $1 WHERE id = $2 RETURNING id, titulo, visible`,
      [visible, id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Publicación no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar publicación:', err);
    res.status(500).json({ message: 'Error al actualizar publicación' });
  }
};

const deletePublicacion = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener el nombre de la foto antes de borrar
    const { rows } = await pool.query('SELECT foto FROM publicaciones WHERE id = $1', [id]);
    if (rows[0]?.foto) {
      const filePath = path.join(__dirname, '../../uploads', rows[0].foto);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // borra imagen del disco
    }
    // Obtener datos de la publicación para InfluxDB antes de borrarla
    const { rows: pubData } = await pool.query(
      'SELECT categoria, ubicacion FROM publicaciones WHERE id = $1', [id]
    );
    await pool.query('DELETE FROM publicaciones WHERE id = $1', [id]);

    // 📊 InfluxDB → registra bajas para mantener métricas limpias
    if (pubData[0]) {
      registrarEvento(
        'baja_publicacion',
        {
          categoria: pubData[0].categoria || 'sin_categoria',
          ubicacion: pubData[0].ubicacion || 'sin_ubicacion',
        },
        { count: 1 }
      );
    }

    res.json({ message: 'Publicación eliminada' });
  } catch (err) {
    console.error('Error al eliminar publicación:', err);
    res.status(500).json({ message: 'Error al eliminar publicación' });
  }
};

const getPublicaciones = async (req, res) => {
  try {
    const {
      q        = '',
      orden    = 'reciente',
      page     = '1',
      limit    = '12',
    } = req.query;

    // Arrays de filtros multi-valor (axios serializa arrays como param repetido)
    const categorias  = [].concat(req.query.categoria  || []).filter(Boolean);
    const estados     = [].concat(req.query.estado     || []).filter(Boolean);
    const ubicaciones = [].concat(req.query.ubicacion  || []).filter(Boolean);

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12)); // máx 50 por seguridad
    const offset   = (pageNum - 1) * limitNum;

    // ── Construcción dinámica de la query ────────────────────────────────────
    const values = [];
    // El catálogo público nunca muestra publicaciones ya donadas
    const filters = ["estado IS DISTINCT FROM 'Donado'"];

    // Full-text search (PostgreSQL ts_vector)
    // Busca en titulo, descripcion y marcaoModelo con operador de prefijo (prefix match)
    if (q.trim()) {
      // plainto_tsquery es tolerante: no explota con caracteres especiales
      // Usamos ILIKE como fallback simple y compatible si no tienes tsvector
      values.push(`%${q.trim()}%`);
      const idx = values.length;
      filters.push(`(
        titulo           ILIKE $${idx}
        OR descripcion   ILIKE $${idx}
        OR marcaoModelo  ILIKE $${idx}
        OR nombredeldispositivo ILIKE $${idx}
      )`);
    }

    // Filtro categoría (OR entre valores seleccionados)
    if (categorias.length > 0) {
      const placeholders = categorias.map(c => {
        values.push(`%${c}%`);
        return `categoria ILIKE $${values.length}`;
      });
      filters.push(`(${placeholders.join(' OR ')})`);
    }

    // Filtro estado
    if (estados.length > 0) {
      const placeholders = estados.map(e => {
        values.push(`%${e}%`);
        return `estado ILIKE $${values.length}`;
      });
      filters.push(`(${placeholders.join(' OR ')})`);
    }

    // Filtro ubicación
    if (ubicaciones.length > 0) {
      const placeholders = ubicaciones.map(u => {
        values.push(`%${u}%`);
        return `ubicacion ILIKE $${values.length}`;
      });
      filters.push(`(${placeholders.join(' OR ')})`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // ── Ordenamiento ─────────────────────────────────────────────────────────
    const orderMap = {
      reciente: 'fecha DESC',
      antiguo:  'fecha ASC',
      az:       'titulo ASC',
      za:       'titulo DESC',
    };
    const orderSQL = orderMap[orden] ?? 'fecha DESC';

    // ── COUNT total (para paginación del frontend) ────────────────────────────
    const countQuery  = `SELECT COUNT(*) FROM publicaciones ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total       = parseInt(countResult.rows[0].count, 10);

    // ── Datos paginados ───────────────────────────────────────────────────────
    const dataQuery = `
      SELECT
        id, titulo, descripcion, categoria, estado, ubicacion,
        foto, fecha, marcaoModelo, nombredeldispositivo, contacto, autor_id
      FROM publicaciones
      ${whereClause}
      ORDER BY ${orderSQL}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limitNum, offset);

    const dataResult = await pool.query(dataQuery, values);

    res.status(200).json({
      rows:  dataResult.rows.map(enriquecerConImpacto),
      total,
      page:  pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });

  } catch (error) {
    console.error('Error en GET /api/publicaciones:', error);
    res.status(500).json({ message: 'Error al obtener publicaciones' });
  }
};

const getPublicacionesFacets = async (req, res) => {
  try {
    const [categorias, estados, ubicaciones] = await Promise.all([
      pool.query(`SELECT categoria AS value, COUNT(*) AS count FROM publicaciones WHERE categoria IS NOT NULL GROUP BY categoria ORDER BY count DESC`),
      pool.query(`SELECT estado    AS value, COUNT(*) AS count FROM publicaciones WHERE estado    IS NOT NULL GROUP BY estado    ORDER BY count DESC`),
      pool.query(`SELECT ubicacion AS value, COUNT(*) AS count FROM publicaciones WHERE ubicacion IS NOT NULL GROUP BY ubicacion ORDER BY count DESC LIMIT 20`),
    ]);

    res.json({
      categorias:  categorias.rows,
      estados:     estados.rows,
      ubicaciones: ubicaciones.rows,
    });
  } catch (err) {
    console.error('Error en /api/publicaciones/facets:', err);
    res.status(500).json({ message: 'Error al obtener facetas' });
  }
};

const getPublicacionById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM publicaciones WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length > 0) {
      res.status(200).json(enriquecerConImpacto(result.rows[0]));
    } else {
      res.status(404).json({ message: 'Publicación no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los detalles de la publicación' });
  }
};

const getPublicacionesByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = 'SELECT * FROM publicaciones WHERE autor_id = $1 ORDER BY id DESC';
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows.map(enriquecerConImpacto));
  } catch (error) {
    console.error('Error al obtener publicaciones del usuario:', error);
    res.status(500).json({ message: 'Error al obtener publicaciones del usuario' });
  }
};

const donarPublicacion = async (req, res) => {
  const { id } = req.params;
  const { usuario_receptor_id } = req.body;

  try {
    // Leer la publicación actual para calcular el impacto ambiental
    const { rows: pubRows } = await pool.query(
      'SELECT * FROM publicaciones WHERE id = $1', [id]
    );
    if (!pubRows[0]) return res.status(404).json({ message: 'Publicación no encontrada' });

    const pub = pubRows[0];

    // Intentar UPDATE completo (con usuario_receptor_id y fecha_donacion)
    let updatedRow;
    try {
      const { rows } = await pool.query(
        `UPDATE publicaciones
         SET estado = 'Donado', usuario_receptor_id = $1, fecha_donacion = NOW()
         WHERE id = $2
         RETURNING *`,
        [usuario_receptor_id, id]
      );
      updatedRow = rows[0];
    } catch {
      // Fallback: columnas nuevas aún no existen en la BD → solo actualizar estado
      const { rows } = await pool.query(
        `UPDATE publicaciones SET estado = 'Donado' WHERE id = $1 RETURNING *`,
        [id]
      );
      updatedRow = rows[0];
    }

    // Calcular impacto ambiental con los datos de la publicación ORIGINAL
    const impacto = calcularImpacto(pub.categoria, pub.estado);

    // 📊 Enviar métrica a InfluxDB
    registrarEvento(
      'donaciones_ambientales',
      {
        categoria:        pub.categoria     || 'desconocida',
        estado_dispositivo: pub.estado      || 'desconocido',
      },
      {
        co2_evitado:         impacto.co2_evitado,
        arboles_equivalentes: impacto.arboles_equivalentes,
        cantidad:            1,
      }
    );

    res.json({
      message: 'Donación confirmada con éxito',
      data:    enriquecerConImpacto(updatedRow),
    });
  } catch (error) {
    console.error('Error al confirmar donación:', error);
    res.status(500).json({ message: 'Error al confirmar la donación' });
  }
};

const getAdminStats = async (req, res) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const { rows } = await pool.query('SELECT COUNT(*) AS total FROM mensajes');
    res.json({ mensajes: parseInt(rows[0].total, 10) });
  } catch (error) {
    console.error('Error en getAdminStats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

const getHistorialAdmin = async (req, res) => {
  // Guard: solo admins (req.user viene del middleware verificarToken)
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol administrador.' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.titulo,
        p.categoria,
        p.fecha,
        p.fecha_donacion,
        -- Donante (quien publicó y donó)
        ud.id     AS donante_id,
        ud.nombre AS donante_nombre,
        ud.email  AS donante_email,
        -- Receptor (quien recibió la donación)
        ur.id     AS receptor_id,
        ur.nombre AS receptor_nombre,
        ur.email  AS receptor_email
      FROM publicaciones p
      LEFT JOIN usuarios ud ON ud.id = p.autor_id
      LEFT JOIN usuarios ur ON ur.id = p.usuario_receptor_id
      WHERE p.estado = 'Donado'
      ORDER BY COALESCE(p.fecha_donacion, p.fecha) DESC
    `);

    // El estado ya es 'Donado' en la BD; usamos 'Usado' como proxy del estado original
    // para la estimación de CO₂ (factor 0.7), que es el valor más neutral y frecuente
    const historial = rows.map(row => ({
      ...row,
      impacto_ambiental: calcularImpacto(row.categoria, 'Usado'),
    }));

    res.json(historial);
  } catch (error) {
    console.error('Error en getHistorialAdmin:', error);
    res.status(500).json({ message: 'Error al obtener historial de donaciones' });
  }
};

const getDashboardStats = async (req, res) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  try {
    const query = `
      SELECT
        p.id,
        p.titulo,
        p.estado,
        p.ubicacion,
        p.verificacion_id,
        p.usuario_receptor_id,
        u.rol AS receptor_rol
      FROM publicaciones p
      LEFT JOIN usuarios u ON p.usuario_receptor_id = u.id
    `;
    const { rows } = await pool.query(query);

    // Geolocation coordinates mapping with jitter
    const getCoordinates = (ubicacion) => {
      const u = (ubicacion || '').toLowerCase();
      let lat = -17.3895, lng = -66.1568; // Cochabamba default
      if (u.includes('quillacollo')) {
        lat = -17.4040;
        lng = -66.2777;
      } else if (u.includes('cercado')) {
        lat = -17.3935;
        lng = -66.1598;
      }
      
      // Slight offset to prevent overlapping markers
      lat += (Math.random() - 0.5) * 0.015;
      lng += (Math.random() - 0.5) * 0.015;
      return { lat, lng };
    };

    const mapPoints = rows.map(r => {
      const isDonacionConcluida = r.estado === 'Donado' && r.receptor_rol !== 'Gestor_RAEE';
      const isReciclajeConcluido = r.estado === 'Reciclado' || 
                                   (r.estado === 'Donado' && r.receptor_rol === 'Gestor_RAEE') ||
                                   (r.estado === 'Reciclaje' && r.usuario_receptor_id !== null);

      let ciclo = 'activo';
      if (isDonacionConcluida) {
        ciclo = 'donacion';
      } else if (isReciclajeConcluido) {
        ciclo = 'reciclaje';
      }

      const coords = getCoordinates(r.ubicacion);

      return {
        id: r.id,
        titulo: r.titulo,
        estado: r.estado,
        ubicacion: r.ubicacion,
        verificado: r.verificacion_id !== null,
        lat: coords.lat,
        lng: coords.lng,
        ciclo
      };
    });

    // Calculate chart statistics
    let donacionPublicados = 0;
    let donacionExitosos = 0;
    let reciclajePublicados = 0;
    let reciclajeExitosos = 0;

    rows.forEach(r => {
      const isReciclajeLine = r.estado === 'Reciclaje' || r.estado === 'Reciclado' || r.receptor_rol === 'Gestor_RAEE';
      const isReciclajeConcluido = r.estado === 'Reciclado' || 
                                   (r.estado === 'Donado' && r.receptor_rol === 'Gestor_RAEE') ||
                                   (r.estado === 'Reciclaje' && r.usuario_receptor_id !== null);

      if (isReciclajeLine) {
        reciclajePublicados++;
        if (isReciclajeConcluido) {
          reciclajeExitosos++;
        }
      } else {
        donacionPublicados++;
        if (r.estado === 'Donado') {
          donacionExitosos++;
        }
      }
    });

    res.json({
      mapa: mapPoints,
      eficiencia: [
        {
          name: 'Línea de Donación',
          publicados: donacionPublicados,
          exitosos: donacionExitosos
        },
        {
          name: 'Línea de Reciclaje',
          publicados: reciclajePublicados,
          exitosos: reciclajeExitosos
        }
      ],
      acumulado: [
        { name: 'Donados', value: donacionExitosos },
        { name: 'Reciclados', value: reciclajeExitosos }
      ]
    });

  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
  }
};

module.exports = {
  upload,
  createPublicacion,
  updatePublicacion,
  deletePublicacion,
  donarPublicacion,
  getPublicaciones,
  getPublicacionesFacets,
  getPublicacionById,
  getPublicacionesByUser,
  getAdminStats,
  getHistorialAdmin,
  getDashboardStats,
};
