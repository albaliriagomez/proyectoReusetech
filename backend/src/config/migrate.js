const fs = require('fs');
const path = require('path');
const pool = require('./db');

/**
 * Ejecuta los archivos de migración .sql pendientes en la carpeta /migrations
 * de forma ordenada, segura e idempotente.
 */
async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../../migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('⚠️ [MIGRACIONES] No se encontró la carpeta de migraciones.');
    return;
  }

  const client = await pool.connect();

  try {
    // 1. Asegurar la existencia de la tabla de control de migraciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Obtener lista de migraciones ya ejecutadas
    const { rows: executedRows } = await client.query(
      'SELECT name FROM schema_migrations'
    );
    const executedMigrations = new Set(executedRows.map(r => r.name));

    // 3. Leer y ordenar los archivos .sql de la carpeta /migrations
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    let appliedCount = 0;

    for (const file of files) {
      if (executedMigrations.has(file)) {
        continue; // Ya fue ejecutada previamente
      }

      console.log(`⏳ [MIGRACIONES] Ejecutando migración: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (name) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ [MIGRACIONES] Migración aplicada exitosamente: ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ [MIGRACIONES] Error al ejecutar migración ${file}:`, err.message);
        throw err; // Propagar error para manejo en la capa superior
      }
    }

    if (appliedCount === 0) {
      console.log('✨ [MIGRACIONES] Base de datos al día. No hay migraciones pendientes.');
    } else {
      console.log(`🎉 [MIGRACIONES] ${appliedCount} migración(es) ejecutada(s) con éxito.`);
    }

  } catch (err) {
    console.error('⚠️ [MIGRACIONES] Fallo durante la comprobación/ejecución de migraciones:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Permitir ejecución directa mediante comando CLI (node src/config/migrate.js)
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };
