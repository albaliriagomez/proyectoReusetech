// src/components/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ilustracion from '../assets/ilustracion.svg'; // Usa la misma ilustración del landing

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', form);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      alert('¡Bienvenido!');
      navigate('/home');
    } catch (error) {
      alert('Correo o contraseña incorrectos');
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
        <h2 className="text-3xl font-bold text-center mb-6 text-[#5bc0de]">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5bc0de]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5bc0de]"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#5bc0de] hover:bg-[#31a6c4] text-white p-3 rounded font-semibold shadow-md"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta?{' '}
          <span
            className="text-[#5bc0de] cursor-pointer hover:underline"
            onClick={() => navigate('/register')}
          >
            Regístrate
          </span>
        </p>
      </motion.div>

      {/* Ilustración al lado */}
      <motion.div
        className="md:w-1/2 mt-10 md:mt-0 md:ml-12 hidden md:block"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        <img
          src={ilustracion}
          alt="Ilustración login"
          className="max-w-sm mx-auto animate-float"
        />
      </motion.div>
    </div>
  );
};

export default Login;
