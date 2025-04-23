// src/components/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ilustracion from '../assets/ilustracion.svg'; // asegúrate que esté en src/assets

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    rol: 'usuario',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', formData);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      console.error('Error al registrar:', error);
      alert('Hubo un error al registrarse.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-6 md:px-20 py-12">
      
      {/* Formulario animado */}
      <motion.div
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-[#5bc0de]">Crear Cuenta</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-3 mb-3 border border-gray-300 rounded focus:ring-[#5bc0de] focus:outline-none"
            required
          />
          <input
            type="text"
            name="apellidos"
            placeholder="Apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            className="w-full p-3 mb-3 border border-gray-300 rounded focus:ring-[#5bc0de] focus:outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 mb-3 border border-gray-300 rounded focus:ring-[#5bc0de] focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 mb-3 border border-gray-300 rounded focus:ring-[#5bc0de] focus:outline-none"
            required
          />
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="w-full p-3 mb-4 border border-gray-300 rounded"
          >
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
          </select>

          <button
            type="submit"
            className="w-full bg-[#5bc0de] hover:bg-[#31a6c4] text-white p-3 rounded font-semibold shadow-md"
          >
            Registrarse
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <span
            className="text-[#5bc0de] cursor-pointer hover:underline"
            onClick={() => navigate('/login')}
          >
            Inicia sesión
          </span>
        </p>
      </motion.div>

      {/* Ilustración animada al costado */}
      <motion.div
        className="md:w-1/2 mt-10 md:mt-0 md:ml-12 hidden md:block"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        <img
          src={ilustracion}
          alt="Ilustración registro"
          className="max-w-sm mx-auto animate-float"
        />
      </motion.div>
    </div>
  );
};

export default Register;
