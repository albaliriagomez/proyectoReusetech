const fetch = require('node-fetch');
const pool = require('../config/db');

const MAPA_ESTADOS_IA = {
  'PARA DONAR': 'Buen estado',
  'PARA REPARAR': 'Usado',
  'PARA REPUESTOS': 'Reciclaje',
  'PARA RECICLAR': 'Reciclaje'
};

const diagnosticoIA = async (req, res) => {
  const { respuestas, dispositivo } = req.body;

  let resultado;
  let estadoCrudo = 'PARA REPARAR';

  try {
    // Llamar al servicio ML de Python usando fetch nativo
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    const response = await fetch(`${aiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enciende:     respuestas.enciende,
        estadoFisico: respuestas.estadoFisico,
        bateria:      respuestas.bateria,
        antiguedad:   respuestas.antiguedad,
        dispositivo:  dispositivo
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('⚠️ [DIAGNOSTICO IA] Servicio ML respondió con error:', response.status, body);
      return res.status(502).json({ error: 'Servicio de diagnóstico ML no disponible', details: body });
    }

    resultado = await response.json();
    if (resultado && resultado.estado) {
      estadoCrudo = resultado.estado;
    }
  } catch (errorML) {
    console.error('⚠️ [DIAGNOSTICO IA] Error llamando al servicio ML:', errorML.message || errorML);
    return res.status(502).json({ error: 'Error llamando al servicio ML', details: String(errorML) });
  }

  try {
    // Homologar el estado de la IA al catálogo limpio
    const estadoHomologado = MAPA_ESTADOS_IA[estadoCrudo] || MAPA_ESTADOS_IA['PARA REPARAR'];

    // Guardar el resultado en la base de datos para auditoría
    const query = `
      INSERT INTO verificaciones_salud (dispositivo, estado_calculado, respuestas_json)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    const values = [dispositivo, estadoHomologado, JSON.stringify(respuestas)];
    const dbResult = await pool.query(query, values);
    const verificacion_id = dbResult.rows[0].id;

    // Retornar el objeto completo con los datos calculados por la IA
    return res.json({
      success: true,
      data: {
        verificacion_id,
        estado: estadoHomologado,
        puntuacion: resultado?.puntuacion ?? resultado?.score ?? null,
        analisis: resultado?.analisis ?? resultado?.diagnostico ?? null,
        impacto_ambiental: resultado?.impacto_ambiental ?? resultado?.impacto ?? null,
        confianza: resultado?.confianza ?? resultado?.confidence ?? null,
        recomendacion_pro: resultado?.recomendacion_pro ?? resultado?.recomendacion ?? null
      }
    });
  } catch (errorDB) {
    console.error('⚠️ [DIAGNOSTICO IA] Error al insertar en la tabla verificaciones_salud (PostgreSQL):', errorDB.message || errorDB);
    return res.status(500).json({ 
      error: "Fallo en la base de datos al registrar la verificación de salud.",
      details: errorDB.message
    });
  }
};

module.exports = { diagnosticoIA };
