const pool = require('./config/db');

async function main() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:", tablesRes.rows.map(r => r.table_name));

    const columnsRes = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'usuarios'
    `);
    console.log("Columns in 'usuarios' table:");
    columnsRes.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    const usersRes = await pool.query(`SELECT id, nombre, email, rol FROM usuarios`);
    console.log("Users in database:", usersRes.rows);

    const pubRes = await pool.query(`SELECT id, titulo, estado FROM publicaciones LIMIT 5`);
    console.log("Some publications in database:", pubRes.rows);

  } catch (err) {
    console.error("Error inspecting database:", err);
  } finally {
    await pool.end();
  }
}

main();
