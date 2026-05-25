// influx.js — Cliente de InfluxDB para ReUseTech
// Envía eventos del backend a InfluxDB Cloud para visualizar en Grafana

const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// ─── Configuración desde .env ─────────────────────────────────────────
const url    = process.env.INFLUX_URL;
const token  = process.env.INFLUX_TOKEN;
const org    = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

// Validación al arrancar
if (!url || !token || !org || !bucket) {
  console.warn('⚠️  InfluxDB no configurado correctamente. Revisa el archivo .env');
} else {
  console.log('📊 InfluxDB conectado:', url, '→ bucket:', bucket);
}

// ─── Cliente de escritura ─────────────────────────────────────────────
const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket, 'ns');
writeApi.useDefaultTags({ app: 'reusetech' });

// ─── Función helper para registrar eventos ────────────────────────────
function registrarEvento(measurement, tags = {}, fields = { count: 1 }) {
  try {
    const point = new Point(measurement);

    // Agregar tags (etiquetas para filtrar)
    Object.entries(tags).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        point.tag(key, String(value));
      }
    });

    // Agregar fields (valores)
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'number') {
        point.intField(key, value);
      } else if (value !== undefined && value !== null) {
        point.stringField(key, String(value));
      }
    });

    writeApi.writePoint(point);
    writeApi.flush().catch(err => console.error('Influx flush error:', err.message));
  } catch (error) {
    console.error('Error registrando evento en Influx:', error.message);
  }
}

// ─── Cierre limpio al apagar el servidor ──────────────────────────────
process.on('SIGINT', async () => {
  try {
    await writeApi.close();
    console.log('InfluxDB cerrado correctamente');
  } catch (e) {
    console.error('Error cerrando InfluxDB:', e.message);
  }
  process.exit(0);
});

module.exports = { registrarEvento };