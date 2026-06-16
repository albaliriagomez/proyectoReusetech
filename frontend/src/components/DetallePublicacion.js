import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Heart, Share2, Calendar, User, MapPin, Tag, 
  Clock, Info, Send, MessageSquare, Check, Cpu, Phone, 
  Mail, ChevronRight, Leaf, Shield, Sparkles, Star, Eye
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const DetallePublicacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const comentarioInputRef = useRef(null);

  // States
  const [publicacion, setPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [activeTab, setActiveTab] = useState('detalles');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);
  const [toast, setToast] = useState(null);

  // Get current user session
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();
  const remitente_id = user?.id;

  // Show status-driven toast notifications
  const showNotification = (message, isError = false) => {
    setToast({ message, type: isError ? 'error' : 'success' });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch publication details on mount or ID change
  useEffect(() => {
    const fetchPublicacion = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/publicaciones/${id}`);
        setPublicacion(response.data);
        
        // Fetch related devices
        if (response.data.categoria) {
          fetchRelatedItems(response.data.categoria);
        }
      } catch (error) {
        console.error('Error al obtener los detalles de la publicación:', error);
        showNotification('No se pudo cargar la publicación', true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicacion();
  }, [id]);

  // Fetch similar devices
  const fetchRelatedItems = async (categoria) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/publicaciones?categoria=${encodeURIComponent(categoria)}&limit=4`);
      const rows = response.data.rows || response.data || [];
      const filtered = rows.filter(item => item.id !== parseInt(id));
      setRelatedItems(filtered.slice(0, 3));
    } catch (error) {
      console.error('Error al obtener dispositivos relacionados:', error);
    }
  };

  // Check if item is favorited & load comments
  useEffect(() => {
    if (publicacion?.id) {
      cargarComentarios();
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      setIsFavorite(favorites.includes(parseInt(id)));
    }
  }, [publicacion, id]);

  // Load public comments
  const cargarComentarios = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/comentarios/${publicacion.id}`);
      setComentarios(res.data);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    }
  };

  // Submit comment
  const enviarComentario = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!nuevoComentario.trim()) return;
  
    try {
      await axios.post(`${API_BASE_URL}/api/comentarios`, {
        publicacion_id: publicacion.id,
        autor_id: user.id,
        contenido: nuevoComentario
      });
      setNuevoComentario('');
      cargarComentarios();
      showNotification('Comentario publicado con éxito');
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      showNotification('Error al enviar comentario', true);
    }
  };

  // Send initial message
  const handleEnviarMensaje = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!mensaje.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/api/mensajes`, {
        remitente_id,
        destinatario_id: publicacion.autor_id,
        publicacion_id: publicacion.id,
        contenido: mensaje
      });
      setMensaje('');
      showNotification('Mensaje enviado con éxito');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      showNotification('Error al enviar el mensaje', true);
    }
  };

  // Navigation to private chat room
  const handleAbrirChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const concepto = user.rol === 'Gestor_RAEE' ? 'Coordinación de Retiro de RAEE' : 'Solicitar Donación';
    navigate(`/chat/${remitente_id}/${publicacion.autor_id}/${publicacion.id}?concepto=${encodeURIComponent(concepto)}`);
  };

  // Add/remove favorite from localStorage
  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(item => item !== parseInt(id));
      setIsFavorite(false);
      showNotification('Eliminado de favoritos');
    } else {
      updatedFavorites = [...favorites, parseInt(id)];
      setIsFavorite(true);
      showNotification('Añadido a favoritos');
    }
    
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Copy URL to share
  const handleCompartir = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('Enlace copiado al portapapeles');
  };

  // Load Google Maps API
  useEffect(() => {
    if (publicacion?.ubicacion) {
      loadGoogleMapsScript();
    }
  }, [publicacion]);

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
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: publicacion.ubicacion }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: results[0].geometry.location,
            zoom: 14,
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry.fill',
                stylers: [{ saturation: -100 }]
              }
            ],
            disableDefaultUI: true,
            zoomControl: true
          });

          new window.google.maps.Marker({
            position: results[0].geometry.location,
            map,
            animation: window.google.maps.Animation.DROP,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#00b0ca',
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: '#ffffff'
            }
          });
        }
      });
    } catch (err) {
      console.error('Error al inicializar el mapa de Google:', err);
    }
  };

  // Get state pill colors calc'd from the sidebar filters
  const getStatusDetails = (estado) => {
    const normalized = (estado || '').toLowerCase();
    if (normalized.includes('buen')) {
      return { color: '#22c55e', text: 'Buen estado', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.18)' };
    } else if (normalized.includes('usado')) {
      return { color: '#f59e0b', text: 'Usado', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' };
    } else if (normalized.includes('recicla')) {
      return { color: '#ef4444', text: 'Reciclaje / RAEE', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)' };
    }
    return { color: '#94a3b8', text: estado || 'No especificado', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.18)' };
  };

  // Set CTA action button text dynamically based on user role and item state
  const getCTAButtonText = () => {
    if (user?.rol === 'Gestor_RAEE' || publicacion?.estado === 'Reciclaje') {
      return 'Coordinar Retiro RAEE';
    }
    return 'Solicitar Donación';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans']">
        <div className="w-12 h-12 border-4 border-[#00b0ca]/20 border-t-[#00b0ca] rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold text-sm">Cargando detalles...</p>
      </div>
    );
  }

  if (!publicacion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8fafc] px-4 font-['Plus_Jakarta_Sans']">
        <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Publicación no encontrada</h2>
        <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">No hemos podido recuperar el dispositivo solicitado. Puede haber sido retirado o donado.</p>
        <Link to="/home" className="mt-6 px-5 py-2.5 bg-[#00b0ca] hover:bg-[#009cb3] text-white font-bold rounded-xl text-sm transition shadow-md">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusDetails(publicacion.estado);

  return (
    <motion.div
      className="min-h-screen bg-[#f8fafc] py-8 px-4 md:px-8 font-['Plus_Jakarta_Sans']"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className={`fixed bottom-6 right-6 px-5 py-3.5 rounded-2xl text-white shadow-2xl z-50 flex items-center gap-2 font-bold text-sm ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {toast.type === 'error' ? <Info size={16} /> : <Check size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation & Header */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <Link 
          to="/home" 
          className="inline-flex items-center text-sm font-black text-slate-500 hover:text-[#00b0ca] transition-colors gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver a listado</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Section (65% width) - Visual & Details */}
        <div className="w-full md:w-8/12 flex flex-col gap-6">
          
          {/* Main Device Image Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-4 shadow-sm relative overflow-hidden group">
            {publicacion.foto ? (
              <div className="aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden relative">
                <img
                  src={`${API_BASE_URL}/uploads/${publicacion.foto}`}
                  alt={publicacion.titulo}
                  className="w-full h-full object-cover cursor-pointer transform group-hover:scale-105 transition duration-500"
                  onClick={() => setImagenAmpliada(true)}
                />
                <div 
                  onClick={() => setImagenAmpliada(true)}
                  className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-black px-4 py-2 rounded-full shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                    Ampliar imagen
                  </span>
                </div>
              </div>
            ) : (
              <div className="aspect-[16/10] bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-200">
                <Cpu className="w-16 h-16 text-[#00b0ca]/30 mb-3" />
                <span className="text-slate-400 font-bold text-sm">Sin imagen disponible</span>
              </div>
            )}
            
            {/* Environmental Impact Indicator */}
            {publicacion.impacto_ambiental && (
              <div className="mt-4 bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-emerald-800 font-extrabold text-sm mb-0.5">Impacto Ecológico</h4>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    Evita la emisión de <strong className="font-black">{publicacion.impacto_ambiental.co2_evitado} kg de CO₂</strong> (~{publicacion.impacto_ambiental.arboles_equivalentes} {publicacion.impacto_ambiental.arboles_equivalentes === 1 ? 'árbol' : 'árboles'} salvados).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details / Comments / Location Tabs */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex gap-2 border-b border-slate-100 pb-3 mb-6 overflow-x-auto">
              {[
                { id: 'detalles', label: 'Especificaciones' },
                { id: 'comentarios', label: `Comentarios (${comentarios.length})` },
                { id: 'ubicacion', label: 'Ubicación' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#00b0ca]/10 text-[#00b0ca]'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content: Details */}
            {activeTab === 'detalles' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-slate-800 font-extrabold text-base mb-3">Descripción técnica</h3>
                  <div className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed whitespace-pre-line border border-slate-100">
                    {publicacion.descripcion || 'Sin descripción detallada disponible.'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                    <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-widest text-slate-400 mb-2">Características</h4>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Funcionamiento verificado</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Diagnóstico de salud realizado</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Economía circular apoyada</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                    <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-widest text-slate-400 mb-2">Condiciones de Retiro</h4>
                    <ul className="text-xs text-slate-600 space-y-2 font-medium">
                      <li>• Coordinar previamente con el donante.</li>
                      <li>• Verificar compatibilidad del cargador.</li>
                      <li>• Retiro presencial bajo normas de cuidado.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab content: Comments */}
            {activeTab === 'comentarios' && (
              <div className="space-y-6">
                <h3 className="text-slate-800 font-extrabold text-base mb-3">Consultas públicas</h3>
                
                {/* List Comments */}
                <div className="space-y-4">
                  {comentarios.length > 0 ? (
                    comentarios.map((comentario) => (
                      <div key={comentario.id} className="flex gap-3 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00b0ca] to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                          {comentario.autor ? comentario.autor.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-slate-800 text-xs">{comentario.autor || 'Usuario'}</span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {new Date(comentario.fecha || Date.now()).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{comentario.contenido}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs font-bold">No hay consultas públicas aún. Haz una pregunta abajo.</p>
                    </div>
                  )}
                </div>

                {/* Post New Comment */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-widest text-slate-400 mb-3">Hacer una pregunta</h4>
                  {user ? (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00b0ca] to-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                        {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1">
                        <textarea
                          ref={comentarioInputRef}
                          className="w-full border border-slate-200 rounded-2xl p-3 text-slate-700 text-xs focus:border-[#00b0ca] focus:ring-1 focus:ring-[#00b0ca] transition outline-none resize-none bg-slate-50"
                          placeholder="Pregunta sobre el estado, accesorios o entrega..."
                          rows="3"
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={enviarComentario}
                            disabled={!nuevoComentario.trim()}
                            className={`px-4 py-2 rounded-xl text-xs font-black text-white transition-all shadow-sm ${
                              nuevoComentario.trim() 
                                ? 'bg-[#00b0ca] hover:bg-[#009cb3] active:scale-95' 
                                : 'bg-slate-300 cursor-not-allowed'
                            }`}
                          >
                            Publicar pregunta
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-slate-500 text-xs font-bold mb-3">Debes iniciar sesión para publicar consultas.</p>
                      <Link to="/login" className="inline-block px-4 py-2 bg-[#00b0ca]/10 text-[#00b0ca] hover:bg-[#00b0ca]/20 font-black text-xs rounded-xl transition">
                        Iniciar Sesión
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab content: Location */}
            {activeTab === 'ubicacion' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-5 h-5 text-[#00b0ca]" />
                  <span className="font-extrabold text-sm">{publicacion.ubicacion || 'Ubicación no especificada'}</span>
                </div>
                <div ref={mapRef} className="h-64 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner" />
              </div>
            )}
          </div>

          {/* Related Devices */}
          {relatedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00b0ca]" />
                Dispositivos similares
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedItems.map(item => (
                  <Link 
                    to={`/detalle/${item.id}`} 
                    key={item.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div className="aspect-video bg-slate-50 overflow-hidden relative">
                      {item.foto ? (
                        <img 
                          src={`${API_BASE_URL}/uploads/${item.foto}`} 
                          alt={item.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Cpu className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-slate-700 text-xs line-clamp-1 group-hover:text-[#00b0ca] transition-colors mb-1">
                        {item.titulo}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-400 font-extrabold bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                          {item.categoria}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusDetails(item.estado).color }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Section (35% width) - Meta & Actions */}
        <div className="w-full md:w-4/12 flex flex-col gap-6 md:sticky md:top-8 self-start">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
            
            {/* Category Pill & Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-150 uppercase tracking-wider">
                {publicacion.categoria || 'Tecnología'}
              </span>
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border transition-all"
                style={{ backgroundColor: statusInfo.bg, borderColor: statusInfo.border, color: statusInfo.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: statusInfo.color }} />
                {statusInfo.text}
              </span>
            </div>

            {/* Imposing Title */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                {publicacion.titulo}
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                <Cpu size={12} className="text-[#00b0ca]" />
                {publicacion.marca_modelo || publicacion.marcaoModelo || 'Modelo no especificado'}
              </p>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Owner/Donor details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-extrabold text-sm text-[#00b0ca] shadow-inner">
                  {publicacion.autor ? publicacion.autor.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold">Ofrecido por</p>
                  <p className="text-sm font-extrabold text-slate-800 leading-snug">{publicacion.autor || 'Usuario ReUseTech'}</p>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                <span>Verificado</span>
              </div>
            </div>

            {/* Publication Date */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Publicado: </span>
              <span>
                {new Date(publicacion.fecha || Date.now()).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>

          </div>

          {/* Contact & Actions Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-slate-800 font-extrabold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00b0ca]" />
              Coordinar Intercambio
            </h3>
            
            {/* Quick message textbox */}
            {user ? (
              <div className="space-y-3">
                <textarea
                  id="mensaje"
                  className="w-full border border-slate-200 rounded-2xl p-3 text-slate-700 text-xs focus:border-[#00b0ca] focus:ring-1 focus:ring-[#00b0ca] transition outline-none resize-none bg-slate-50"
                  placeholder={`Hola, estoy interesado en este equipo...`}
                  rows="3"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
                
                {/* CTA Action button */}
                <button
                  onClick={handleEnviarMensaje}
                  disabled={!mensaje.trim()}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                    mensaje.trim() 
                      ? 'bg-[#00b0ca] hover:bg-[#009cb3] hover:shadow-lg active:scale-95' 
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar primer mensaje
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <p className="text-slate-500 text-xs font-bold mb-3">Inicia sesión para enviar una propuesta.</p>
                <Link to="/login" className="inline-block px-5 py-2.5 bg-[#00b0ca] hover:bg-[#009cb3] text-white font-extrabold text-xs rounded-xl transition shadow-sm">
                  Iniciar Sesión
                </Link>
              </div>
            )}

            {/* Direct private chat button */}
            <button
              onClick={handleAbrirChat}
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-slate-150 hover:bg-slate-50 text-slate-700 font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#00b0ca]" />
              {getCTAButtonText()}
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {/* Favorites & Share quick actions */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`flex-1 py-3 px-4 rounded-xl border border-slate-150 text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  isFavorite 
                    ? 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100/50' 
                    : 'bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
                <span>{isFavorite ? 'Guardado' : 'Favorito'}</span>
              </button>
              <button
                onClick={handleCompartir}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-xs font-black text-slate-600 flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 className="w-4 h-4 text-[#00b0ca]" />
                <span>Compartir</span>
              </button>
            </div>

          </div>

          {/* Quick Safety Box */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-[2.5rem] p-5">
            <h4 className="text-blue-800 font-extrabold text-xs flex items-center gap-1.5 mb-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Recomendaciones de seguridad
            </h4>
            <ul className="text-[10px] text-blue-700 font-bold space-y-1.5">
              <li>• Mantén la coordinación y los mensajes dentro del chat oficial.</li>
              <li>• Acuerda puntos de encuentro seguros y de luz diurna.</li>
              <li>• Revisa el funcionamiento del equipo antes del retiro.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Image zoom modal overlay */}
      <AnimatePresence>
        {imagenAmpliada && (
          <motion.div 
            className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImagenAmpliada(false)}
          >
            <motion.div
              className="relative max-w-4xl max-h-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={`${API_BASE_URL}/uploads/${publicacion.foto}`} 
                alt={publicacion.titulo}
                className="max-h-[85vh] max-w-full object-contain rounded-3xl border border-white/10 shadow-2xl"
              />
              <button 
                className="absolute top-4 right-4 bg-white hover:bg-slate-100 text-slate-800 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg transition active:scale-95"
                onClick={() => setImagenAmpliada(false)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default DetallePublicacion;