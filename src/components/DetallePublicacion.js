import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaMapMarkerAlt, FaTag, FaCommentAlt, 
         FaPaperPlane, FaHeart, FaRegHeart, FaShare, FaChevronLeft, 
         FaClock, FaInfoCircle, FaPhone, FaEnvelope, FaArrowLeft,
         FaStar, FaStarHalfAlt, FaRegStar, FaCheck, FaEye } from 'react-icons/fa';

const DetallePublicacion = () => {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [activeTab, setActiveTab] = useState('detalles');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(false);
  const mapRef = useRef(null);
  const comentarioInputRef = useRef(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 100) + 20);

  // Get user from localStorage or use a default
  const user = JSON.parse(localStorage.getItem('user')) || { id: 1 };
  const remitente_id = user.id;

  useEffect(() => {
    const fetchPublicacion = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/publicaciones/${id}`);
        setPublicacion(response.data);
        
        // Log view
        incrementViewCount();
        
        // Get related items
        fetchRelatedItems(response.data.categoria);
      } catch (error) {
        console.error('Error al obtener los detalles:', error);
        showNotification('No se pudo cargar la publicación', true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicacion();
  }, [id]);

  const incrementViewCount = async () => {
    try {
      // This would be a real API call in production
      // await axios.post(`http://localhost:5000/api/publicaciones/${id}/view`);
      setViewCount(prev => prev + 1);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const fetchRelatedItems = async (categoria) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/publicaciones?categoria=${categoria}&limit=4`);
      // Filter out current publication
      const filtered = response.data.filter(item => item.id !== parseInt(id));
      setRelatedItems(filtered.slice(0, 3)); // Get max 3 items
    } catch (error) {
      console.error('Error fetching related items:', error);
    }
  };

  useEffect(() => {
    if (publicacion?.ubicacion) loadGoogleMapsScript();
  }, [publicacion]);

  useEffect(() => {
    if (publicacion?.id) {
      cargarComentarios();
      // Check if item is in favorites
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      setIsFavorite(favorites.includes(parseInt(id)));
    }
  }, [publicacion, id]);
  
  const cargarComentarios = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comentarios/${publicacion.id}`);
      setComentarios(res.data);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    }
  };
  
  const loadGoogleMapsScript = () => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      window.initMap = initMap;
    } else {
      initMap();
    }
  };

  const initMap = () => {
    if (!mapRef.current) return;
    
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: publicacion.ubicacion }, (results, status) => {
      if (status === 'OK') {
        const map = new window.google.maps.Map(mapRef.current, {
          center: results[0].geometry.location,
          zoom: 15,
          styles: [
            {
              featureType: "all",
              elementType: "geometry.fill",
              stylers: [{ saturation: -100 }]
            }
          ]
        });

        new window.google.maps.Marker({
          position: results[0].geometry.location,
          map,
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#0099cc",
            fillOpacity: 0.7,
            strokeWeight: 2,
            strokeColor: "#ffffff"
          }
        });
      }
    });
  };

  const handleEnviarMensaje = async () => {
    if (!mensaje) return;
    try {
      await axios.post('http://localhost:5000/api/mensajes', {
        remitente_id,
        destinatario_id: publicacion.autor_id,
        publicacion_id: publicacion.id,
        contenido: mensaje
      });
      setMensaje('');
      showNotification('Mensaje enviado con éxito');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      showNotification('Error al enviar mensaje', true);
    }
  };

  const handleAbrirChat = () => {
    navigate(`/chat/${remitente_id}/${publicacion.autor_id}/${publicacion.id}`);
  };

  const enviarComentario = async () => {
    if (!nuevoComentario || !user) return;
  
    try {
      await axios.post('http://localhost:5000/api/comentarios', {
        publicacion_id: publicacion.id,
        autor_id: user.id,
        contenido: nuevoComentario
      });
      setNuevoComentario('');
      cargarComentarios();
      showNotification('Comentario enviado correctamente');
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      showNotification('Error al enviar comentario', true);
    }
  };

  const handleFocusComentarios = () => {
    setActiveTab('comentarios');
    setTimeout(() => {
      comentarioInputRef.current?.focus();
    }, 300);
  };

  const handleToggleFavorite = () => {
    // Update local state
    setIsFavorite(!isFavorite);
    
    // Update localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(item => item !== parseInt(id));
    } else {
      updatedFavorites = [...favorites, parseInt(id)];
    }
    
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    showNotification(isFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos');
  };

  const handleCompartir = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('Enlace copiado al portapapeles');
  };

  const showNotification = (message, isError = false) => {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
      isError ? 'bg-red-500' : 'bg-green-500'
    } shadow-lg z-50 animate-fadeIn`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('animate-fadeOut');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  const renderStarRating = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (hasHalfStar && i === fullStars + 1) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-white to-cyan-50">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-cyan-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Cargando detalles...</p>
      </div>
    );
  }

  if (!publicacion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-white to-cyan-50">
        <FaInfoCircle className="text-5xl text-gray-400 mb-4" />
        <p className="text-xl text-gray-600">No se encontró la publicación</p>
        <Link to="/" className="mt-6 text-cyan-600 hover:text-cyan-700 font-medium">
          Volver a la página principal
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8 px-4 md:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Navegación superior */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-cyan-600 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Volver a listado</span>
        </Link>
        
        <div className="flex items-center text-sm text-gray-500">
          <FaEye className="mr-1" />
          <span>{viewCount} visualizaciones</span>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      <AnimatePresence>
        {imagenAmpliada && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImagenAmpliada(false)}
          >
            <motion.div
              className="relative max-w-4xl max-h-full p-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <img 
                src={`http://localhost:5000/uploads/${publicacion.foto}`} 
                alt={publicacion.titulo}
                className="max-h-[90vh] max-w-full object-contain rounded-lg"
              />
              <button 
                className="absolute top-4 right-4 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-2 text-gray-800"
                onClick={() => setImagenAmpliada(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Encabezado */}
          <div className="p-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{publicacion.titulo}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white text-opacity-90">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span>{new Date(publicacion.fecha || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    <span>{publicacion.autor}</span>
                  </div>
                  {publicacion.ubicacion && (
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{publicacion.ubicacion}</span>
                    </div>
                  )}
                  {publicacion.categoria && (
                    <div className="flex items-center">
                      <FaTag className="mr-2" />
                      <span>{publicacion.categoria}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex mt-4 md:mt-0 gap-2">
                <button 
                  onClick={handleToggleFavorite}
                  className="flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full w-10 h-10"
                  aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                >
                  {isFavorite ? <FaHeart className="text-red-400" /> : <FaRegHeart />}
                </button>
                <button 
                  onClick={handleCompartir}
                  className="flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full w-10 h-10"
                  aria-label="Compartir"
                >
                  <FaShare />
                </button>
              </div>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('detalles')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'detalles'
                    ? 'border-b-2 border-cyan-500 text-cyan-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Detalles
              </button>
              <button
                onClick={() => setActiveTab('comentarios')}
                className={`px-6 py-4 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'comentarios'
                    ? 'border-b-2 border-cyan-500 text-cyan-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Comentarios
                <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {comentarios.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('contacto')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'contacto'
                    ? 'border-b-2 border-cyan-500 text-cyan-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contactar
              </button>
            </nav>
          </div>

          {/* Contenido según la pestaña activa */}
          <div className="p-6">
            {/* Pestaña de detalles */}
            {activeTab === 'detalles' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Columna de imagen y acciones rápidas */}
                <div className="lg:col-span-2">
                  <div className="relative overflow-hidden rounded-lg shadow-sm mb-4 bg-gray-100 group">
                    {publicacion.foto ? (
                      <>
                        <div className="aspect-video bg-gray-200 overflow-hidden">
                          <img
                            src={`http://localhost:5000/uploads/${publicacion.foto}`}
                            alt={publicacion.titulo}
                            className="w-full h-full object-cover cursor-pointer transform group-hover:scale-105 transition duration-300"
                            onClick={() => setImagenAmpliada(true)}
                          />
                        </div>
                        <button 
                          onClick={() => setImagenAmpliada(true)}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"
                        >
                          <span className="bg-white bg-opacity-75 text-gray-800 px-4 py-2 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            Ver imagen
                          </span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm shadow-sm">
                        {publicacion.estado || 'Disponible'}
                      </div>
                    </div>
                  </div>

                  {/* Calificación */}
                  <div className="flex items-center justify-between p-2 mb-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Valoración del dispositivo</div>
                    {renderStarRating()}
                  </div>

                  {/* Acciones rápidas */}
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={handleFocusComentarios}
                      className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition"
                    >
                      <FaCommentAlt />
                      <span>Comentar</span>
                    </button>
                    <button
                      onClick={handleAbrirChat}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition"
                    >
                      <FaPaperPlane />
                      <span>Mensaje</span>
                    </button>
                  </div>

                  {/* Ubicación */}
                  {publicacion.ubicacion && (
                    <div className="border border-gray-200 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-cyan-500" />
                        Ubicación
                      </h3>
                      <p className="text-gray-700 mb-3">{publicacion.ubicacion}</p>
                      <div ref={mapRef} className="h-48 rounded-md bg-gray-200 overflow-hidden" />
                    </div>
                  )}
                  
                  {/* Información de seguridad */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800 text-sm">
                    <div className="flex items-start">
                      <FaInfoCircle className="text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium mb-1">Información importante:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Verifica el estado del dispositivo antes de cualquier acuerdo</li>
                          <li>Reúnete en lugares seguros y públicos</li>
                          <li>Reporta cualquier actividad sospechosa</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna de información */}
                <div className="lg:col-span-3">
                  {/* Detalles del dispositivo */}
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                      <span className="bg-cyan-100 text-cyan-600 p-1 rounded-md mr-2">
                        <FaInfoCircle />
                      </span>
                      Información del dispositivo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Nombre del dispositivo</p>
                        <p className="text-gray-800 font-medium">{publicacion.nombredeldispositivo || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Marca / Modelo</p>
                        <p className="text-gray-800 font-medium">{publicacion.marcaoModelo || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Categoría</p>
                        <p className="text-gray-800 font-medium">{publicacion.categoria || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            (publicacion.estado || '').toLowerCase().includes('bueno') 
                              ? 'bg-green-500' 
                              : (publicacion.estado || '').toLowerCase().includes('regular')
                                ? 'bg-yellow-500'
                                : 'bg-gray-500'
                          }`}></span>
                          <p className="text-gray-800 font-medium">{publicacion.estado || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Características destacadas */}
                    <div className="mt-6 mb-6">
                      <p className="text-sm text-gray-500 mb-2">Características destacadas</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {['Buen estado', 'Incluye accesorios', 'Funcionamiento óptimo', 'Embalaje original'].map((item, index) => (
                          <div key={index} className="flex items-center bg-gray-50 rounded-md p-2">
                            <FaCheck className="text-green-500 mr-2" />
                            <span className="text-gray-700 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 mb-2">Descripción</p>
                      <div className="bg-gray-50 p-4 rounded-lg prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">{publicacion.descripcion || 'Sin descripción'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center mb-2">
                        <FaUser className="text-cyan-500 mr-2" />
                        <h4 className="font-medium text-gray-800">Sobre el propietario</h4>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {publicacion.autor} está compartiendo este dispositivo con la comunidad.
                      </p>
                      <div className="mt-3 flex items-center">
                        <div className="h-8 w-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-semibold text-sm mr-2">
                          {publicacion.autor ? publicacion.autor.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Miembro desde</p>
                          <p className="text-sm font-medium">Enero 2023</p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center mb-2">
                        <FaClock className="text-cyan-500 mr-2" />
                        <h4 className="font-medium text-gray-800">Detalles de publicación</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        Publicado el: {publicacion.fecha 
                          ? new Date(publicacion.fecha).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })
                          : 'Fecha desconocida'
                        }
                      </p>
                      <p className="text-gray-600 text-sm">
                        ID de referencia: #{publicacion.id}
                      </p>
                    </div>
                  </div>
                  
                  {/* Políticas */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-800 mb-2">Políticas de intercambio</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Contacta con el propietario para acordar los detalles</li>
                      <li>• Verifica el estado del dispositivo antes del intercambio</li>
                      <li>• No se aceptan devoluciones una vez realizado el intercambio</li>
                    </ul>
                  </div>

                  {/* Elementos relacionados */}
                  {relatedItems.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Dispositivos similares</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedItems.map(item => (
                          <Link 
                            to={`/detalle/${item.id}`} 
                            key={item.id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group"
                          >
                            <div className="aspect-video bg-gray-100 overflow-hidden">
                              {item.foto ? (
                                <img 
                                  src={`http://localhost:5000/uploads/${item.foto}`} 
                                  alt={item.titulo}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                  <FaInfoCircle className="text-3xl" />
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium text-gray-800 mb-1 truncate group-hover:text-cyan-600 transition">
                                {item.titulo}
                              </h4>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{item.categoria}</span>
                                {renderStarRating(4.0 + Math.random())}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pestaña de comentarios */}
            {activeTab === 'comentarios' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Comentarios públicos</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-6">
                      {comentarios.length > 0 ? (
                        comentarios.map((comentario) => (
                          <div key={comentario.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-start">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mr-3">
                                {comentario.autor ? comentario.autor.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-gray-800">{comentario.autor || 'Usuario anónimo'}</h4>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comentario.fecha || Date.now()).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{comentario.contenido}</p>
                                <div className="mt-2 flex items-center text-sm gap-4">
                                  <button className="text-gray-500 hover:text-cyan-600 transition flex items-center gap-1">
                                    <FaHeart className="text-xs" />
                                    <span>Me gusta</span>
                                  </button>
                                  <button className="text-gray-500 hover:text-cyan-600 transition flex items-center gap-1">
                                    <FaCommentAlt className="text-xs" />
                                    <span>Responder</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FaCommentAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                          <p className="text-gray-500">No hay comentarios todavía. ¡Sé el primero en comentar!</p>
                        </div>
                      )}
                    </div>

                    {/* Formulario para añadir comentarios */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Deja un comentario</h4>
                      <div className="flex">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mr-3">
                          {user ? (user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U') : 'U'}
                        </div>
                        <div className="flex-1">
                          <textarea
                            ref={comentarioInputRef}
                            className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition resize-none"
                            placeholder="Escribe tu comentario aquí..."
                            rows="3"
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                          ></textarea>
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={enviarComentario}
                              disabled={!nuevoComentario.trim()}
                              className={`px-4 py-2 rounded-lg text-white font-medium 
                                ${nuevoComentario.trim() 
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' 
                                  : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                              Enviar comentario
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ sección opcional */}
                <div className="border border-gray-200 rounded-lg p-6 mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Preguntas frecuentes</h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-100 pb-4">
                      <h4 className="font-medium text-gray-800 mb-2">¿Cómo puedo contactar al propietario?</h4>
                      <p className="text-gray-600">
                        Puedes utilizar la sección "Contactar" para enviar un mensaje directo al propietario del dispositivo.
                      </p>
                    </div>
                    <div className="border-b border-gray-100 pb-4">
                      <h4 className="font-medium text-gray-800 mb-2">¿Es posible verificar el dispositivo antes del intercambio?</h4>
                      <p className="text-gray-600">
                        Sí, recomendamos coordinar con el propietario para verificar el estado y funcionamiento del dispositivo antes de realizar cualquier intercambio.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">¿Dónde puedo reportar problemas con una publicación?</h4>
                      <p className="text-gray-600">
                        Si encuentras algún problema con esta publicación, puedes reportarlo utilizando el botón "Reportar" en la parte inferior de la página o contactar con nuestro servicio de atención al usuario.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña de contacto */}
            {activeTab === 'contacto' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Contacta con el propietario</h3>
                  
                  {/* Información de contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 mr-4">
                          {publicacion.autor ? publicacion.autor.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{publicacion.autor || 'Usuario'}</h4>
                          <p className="text-sm text-gray-500">Propietario del dispositivo</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FaPhone className="text-cyan-500 mr-2" />
                          <span>Contacto disponible por mensajes</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaEnvelope className="text-cyan-500 mr-2" />
                          <span>Email protegido por privacidad</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaClock className="text-cyan-500 mr-2" />
                          <span>Tiempo medio de respuesta: 2 horas</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                        <FaInfoCircle className="text-blue-500 mr-2" />
                        Consejos de seguridad
                      </h4>
                      <ul className="text-blue-700 text-sm space-y-2">
                        <li className="flex items-start">
                          <FaCheck className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Mantén toda la comunicación dentro de la plataforma</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheck className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Nunca compartas información financiera sensible</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheck className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Reúnete en lugares públicos para intercambios o verificaciones</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheck className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Reporta cualquier situación sospechosa a nuestro equipo</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Formulario de contacto */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Enviar mensaje</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                          Tu mensaje
                        </label>
                        <textarea
                          id="mensaje"
                          className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition resize-none"
                          placeholder="Hola, estoy interesado en este dispositivo. ¿Sigue disponible?"
                          rows="4"
                          value={mensaje}
                          onChange={(e) => setMensaje(e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <button
                          onClick={handleEnviarMensaje}
                          disabled={!mensaje.trim()}
                          className={`px-6 py-3 rounded-lg text-white font-medium flex-1 flex items-center justify-center
                            ${mensaje.trim() 
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' 
                              : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                          <FaPaperPlane className="mr-2" />
                          Enviar mensaje
                        </button>
                        <button
                          onClick={handleAbrirChat}
                          className="px-6 py-3 rounded-lg border border-cyan-500 text-cyan-600 font-medium hover:bg-cyan-50 flex-1 flex items-center justify-center"
                        >
                          <FaCommentAlt className="mr-2" />
                          Abrir chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tiempo de respuesta */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center border border-gray-200">
                  <div className="h-12 w-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mr-4">
                    <FaClock className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Tiempo de respuesta rápido</h4>
                    <p className="text-sm text-gray-600">
                      El propietario suele responder a los mensajes en menos de 2 horas
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ReUseTech - Plataforma de intercambio sostenible de dispositivos tecnológicos</p>
            <div className="mt-2 flex justify-center space-x-4">
              <button className="hover:text-cyan-600 transition">Reportar publicación</button>
              <button className="hover:text-cyan-600 transition">Política de privacidad</button>
              <button className="hover:text-cyan-600 transition">Términos de uso</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetallePublicacion;