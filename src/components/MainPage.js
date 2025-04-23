import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaLocationArrow, FaCalendarAlt, FaFilter, FaSearch } from 'react-icons/fa';

const MainPage = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPublicaciones = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/publicaciones');
        setPublicaciones(response.data);
      } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicaciones();
  }, []);

  // Categorías únicas para el filtro
  const categorias = ['todas', ...new Set(publicaciones.map(p => p.categoria || 'General'))];
  
  // Filtrar publicaciones por categoría
  const publicacionesFiltradas = categoriaFiltro === 'todas' 
    ? publicaciones 
    : publicaciones.filter(p => (p.categoria || 'General') === categoriaFiltro);

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
      {/* Header con buscador */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-8 px-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Explorar tecnología</h1>
              <p className="text-gray-600 mt-1">Encuentra dispositivos reutilizables para darles una segunda vida</p>
            </div>
            <div className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar dispositivos..."
                  className="w-full md:w-64 px-4 py-2 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-500">
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publicaciones con filtros */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Cabecera con filtros */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-cyan-500" />
              <span className="font-medium text-gray-700">Filtrar por:</span>
              <div className="flex flex-wrap gap-2">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    className={`px-3 py-1 text-sm rounded-full transition ${
                      categoriaFiltro === cat
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Link 
              to="/buscar" 
              className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
            >
              Búsqueda avanzada <FaLocationArrow size={12} />
            </Link>
          </div>

          {/* Contenido de publicaciones */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : publicacionesFiltradas.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No hay publicaciones disponibles en esta categoría</p>
              {categoriaFiltro !== 'todas' && (
                <button 
                  onClick={() => setCategoriaFiltro('todas')}
                  className="mt-4 text-cyan-600 hover:text-cyan-700"
                >
                  Ver todas las categorías
                </button>
              )}
            </div>
          ) : (
            <motion.div
              className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {publicacionesFiltradas.map((publicacion) => (
                <motion.div
                  key={publicacion.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                  variants={itemVariants}
                >
                  <Link to={`/Detalle/${publicacion.id}`} className="block overflow-hidden relative">
                    {publicacion.foto ? (
                      <img
                        src={`http://localhost:5000/uploads/${publicacion.foto}`}
                        alt="Imagen de publicación"
                        className="w-full h-52 object-cover transform hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-52 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                      {publicacion.categoria || 'General'}
                    </div>
                  </Link>
                  <div className="p-5 flex-grow flex flex-col">
                    <Link to={`/Detalle/${publicacion.id}`}>
                      <h3 className="text-xl font-bold text-gray-800 hover:text-cyan-600 transition">
                        {publicacion.titulo}
                      </h3>
                    </Link>
                    <div className="flex items-center text-gray-500 text-sm mt-2 mb-3">
                      <FaCalendarAlt className="mr-1" size={14} />
                      <span>{new Date(publicacion.fecha || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 mt-2 flex-grow">
                      {publicacion.descripcion?.length > 100
                        ? publicacion.descripcion.slice(0, 100) + '...'
                        : publicacion.descripcion}
                    </p>
                    <Link
                      to={`/Detalle/${publicacion.id}`}
                      className="mt-4 text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center"
                    >
                      Ver detalles
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Sección informativa sin CTA redundante */}
      <section className="bg-gradient-to-r from-cyan-50 to-blue-50 py-10 px-6 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Sobre ReUseTech</h2>
              <p className="text-gray-600 mb-4">
                Somos una plataforma dedicada a promover la economía circular en el sector tecnológico. 
                Facilitamos la reutilización de dispositivos electrónicos para reducir el desperdicio y 
                el impacto ambiental de la tecnología.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-500 text-xl"></span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Reducción de desechos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-500 text-xl"></span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Ahorro económico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-500 text-xl"></span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Comunidad colaborativa</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="w-64 h-64 bg-cyan-100 rounded-full flex items-center justify-center">
                <span className="text-5xl"></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage;