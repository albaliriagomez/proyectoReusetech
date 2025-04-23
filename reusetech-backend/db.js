require('dotenv').config();
const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

pool.connect()
    .then(() => console.log(" Conectado a PostgreSQL"))
    .catch(err => console.error(" Error de conexión a PostgreSQL:", err));

module.exports = pool;
