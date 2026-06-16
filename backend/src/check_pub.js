const pool = require('./config/db');

async function main() {
  try {
    const res = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'usuarios'::regclass
    `);
    console.log("Constraints on 'usuarios':", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
