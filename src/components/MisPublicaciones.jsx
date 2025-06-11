import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const MisPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMisPublicaciones = async () => {
      setIsLoading(true);
      try {
        // Assuming there's a way to get the current user's ID
        // In a real app, this would come from authentication context
        const userId = localStorage.getItem('userId') || '1'; // Fallback to '1' for demo
        const response = await axios.get(`http://localhost:5000/api/publicaciones/usuario/${userId}`);
        setPublicaciones(response.data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener mis publicaciones:', error);
        setError('No se pudieron cargar las publicaciones. Por favor intenta más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMisPublicaciones();
  }, []);

  const handleDeletePublicacion = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      try {
        await axios.delete(`http://localhost:5000/api/publicaciones/${id}`);
        setPublicaciones(publicaciones.filter(pub => pub.id !== id));
      } catch (error) {
        console.error('Error al eliminar la publicación:', error);
        alert('No se pudo eliminar la publicación. Por favor intenta más tarde.');
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-8 px-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mis Publicaciones</h1>
              <p className="text-gray-600 mt-1">Gestiona los dispositivos que has publicado</p>
            </div>
            <Link 
              to="/publicar" 
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <FaPlus /> Nueva publicación
            </Link>
          </div>
        </div>
      </div>

      {/* Publicaciones */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : publicaciones.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <h3 className="text-gray-800 text-xl font-semibold mb-2">Aún no tienes publicaciones</h3>
              <p className="text-gray-500 mb-6">Comienza publicando tu primer dispositivo para reutilizar</p>
              <Link 
                to="/from" 
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition"
              >
                <FaPlus /> Crear publicación
              </Link>
            </div>
          ) : (
            <motion.div
              className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {publicaciones.map((publicacion) => (
                <motion.div
                  key={publicacion.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                  variants={itemVariants}
                >
                  <div className="relative">
                    {publicacion.foto ? (
                      <img
                        src={`http://localhost:5000/uploads/${publicacion.foto}`}
                        alt="Imagen de publicación"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                      {publicacion.categoria || 'General'}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {publicacion.titulo}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <FaCalendarAlt className="mr-1" size={14} />
                      <span>{new Date(publicacion.fecha || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 flex-grow">
                      {publicacion.descripcion?.length > 100
                        ? publicacion.descripcion.slice(0, 100) + '...'
                        : publicacion.descripcion}
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <Link
                        to={`/Detalle/${publicacion.id}`}
                        className="text-cyan-600 hover:text-cyan-700 font-semibold"
                      >
                        Ver detalles
                      </Link>
                      <div className="flex gap-2">
                        <Link
                          to={`/editar/${publicacion.id}`}
                          className="text-gray-600 hover:text-cyan-600 transition"
                        >
                          <FaEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeletePublicacion(publicacion.id)}
                          className="text-gray-600 hover:text-red-600 transition"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Sección de ayuda */}
      <section className="bg-gray-50 py-10 px-6 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Consejos para tus publicaciones</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mb-3">
                  <span className="text-cyan-500 text-xl">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Fotos de calidad</h3>
                <p className="text-gray-600 text-sm">Incluye fotos claras y bien iluminadas del dispositivo desde varios ángulos.</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mb-3">
                  <span className="text-cyan-500 text-xl">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Descripción detallada</h3>
                <p className="text-gray-600 text-sm">Menciona todas las especificaciones técnicas y el estado actual del dispositivo.</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mb-3">
                  <span className="text-cyan-500 text-xl">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Categoría correcta</h3>
                <p className="text-gray-600 text-sm">Asegúrate de elegir la categoría adecuada para que tu publicación llegue a las personas interesadas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MisPublicaciones;