const bcrypt = require('bcryptjs');
const jwt   = require('jsonwebtoken');
const pool = require('../config/db');
const { registrarEvento } = require('../config/influx');

const register = async (req, res) => {
  const { nombre, apellidos, email, password, rol } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  let mappedRol = rol;
  if (rol === 'usuario') {
    mappedRol = 'Particular';
  }

  // Ensure it is one of the 4 homologated values
  if (!['Particular', 'Fundacion', 'Gestor_RAEE', 'admin'].includes(mappedRol)) {
    mappedRol = 'Particular';
  }

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellidos, email, password, rol)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, apellidos, email, hashedPassword, mappedRol]
    );
    // 📊 Enviar evento a InfluxDB
    registrarEvento('registro', { rol: mappedRol }, { count: 1 });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error de registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }

    const user = result.rows[0];

    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }

    // Generar JWT — expira en 7 días
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 📊 Enviar evento a InfluxDB
    registrarEvento('login', { rol: user.rol || 'usuario' }, { count: 1, user_id: user.id });

    // Excluir el hash de contraseña de la respuesta
    const { password: _pwd, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = { register, login };
