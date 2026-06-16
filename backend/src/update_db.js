const pool = require('./config/db');

async function main() {
  try {
    console.log("Starting DB update...");
    
    // 1. Drop old constraint first so we can update to new roles!
    await pool.query(`
      ALTER TABLE usuarios 
      DROP CONSTRAINT IF EXISTS usuarios_rol_check;
    `);
    console.log("Old CHECK constraint dropped (if existed).");

    // 2. Update existing roles to comply with the new constraint
    const updateRes = await pool.query(`
      UPDATE usuarios 
      SET rol = CASE 
        WHEN email = 'admin@gmail.com' THEN 'admin'
        WHEN email = 'liriaalba@gmail.com' THEN 'Particular'
        WHEN rol = 'usuario' THEN 'Particular'
        ELSE rol
      END
    `);
    console.log(`Updated ${updateRes.rowCount} users in DB.`);

    // 3. Add new CHECK constraint to usuarios table
    await pool.query(`
      ALTER TABLE usuarios 
      ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('Particular', 'Fundacion', 'Gestor_RAEE', 'admin'));
    `);
    console.log("New CHECK constraint added successfully to 'usuarios' table.");

    // Verify
    const verifyRes = await pool.query(`SELECT id, nombre, email, rol FROM usuarios`);
    console.log("Updated users list:", verifyRes.rows);

    // 4. Add 'leido' column to 'mensajes' table if it does not exist
    await pool.query(`
      ALTER TABLE mensajes 
      ADD COLUMN IF NOT EXISTS leido BOOLEAN DEFAULT false;
    `);
    console.log("Column 'leido' checked/added to 'mensajes' table successfully.");

  } catch (err) {
    console.error("Error updating DB schema/data:", err);
  } finally {
    await pool.end();
  }
}

main();
