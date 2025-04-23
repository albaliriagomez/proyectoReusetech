// src/components/PerfilUsuario.jsx
import React, { useState } from 'react';
import { FaUserCircle, FaEnvelope, FaCog, FaFileAlt, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ FALTA IMPORTACIÓN

const PerfilUsuario = () => {
  const usuarioInicial = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate(); // ✅ DEFINICIÓN
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    nombre: usuarioInicial?.nombre || '',
    email: usuarioInicial?.email || '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/usuarios/${usuarioInicial.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Perfil actualizado con éxito');
      localStorage.setItem('user', JSON.stringify(response.data.usuarioActualizado));
      setModoEdicion(false);
    } catch (error) {
      alert('Error al actualizar perfil');
      console.error(error);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-12 px-6 md:px-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white shadow-2xl rounded-xl p-8 md:p-12 max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <FaUserCircle className="text-7xl text-blue-500" />
          <div>
            {modoEdicion ? (
              <>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="border rounded p-2 mb-2 w-full"
                  placeholder="Nombre"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border rounded p-2 mb-2 w-full"
                  placeholder="Correo electrónico"
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                  placeholder="Nueva contraseña (opcional)"
                />
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800">{formData.nombre}</h2>
                <p className="text-lg text-gray-600 mt-2 flex items-center gap-2">
                  <FaEnvelope /> {formData.email}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Opciones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/mis-publicaciones/${usuarioInicial.id}`)} // ✅ CORREGIDO
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-6 rounded-lg flex items-center gap-2"
            >
              <FaFileAlt /> Ver mis publicaciones
            </button>
            {modoEdicion ? (
              <button
                onClick={guardarCambios}
                className="bg-green-100 hover:bg-green-200 text-green-700 py-3 px-6 rounded-lg flex items-center gap-2"
              >
                <FaSave /> Guardar cambios
              </button>
            ) : (
              <button
                onClick={() => setModoEdicion(true)}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-3 px-6 rounded-lg flex items-center gap-2"
              >
                <FaCog /> Editar perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerfilUsuario;
