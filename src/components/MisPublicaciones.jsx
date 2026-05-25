import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Calendar, Edit3, Trash2, Plus, 
  Smartphone, ChevronRight, Info, 
  AlertCircle, LayoutGrid, Image as ImageIcon
} from 'lucide-react';

const MisPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMisPublicaciones = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId') || '1'; 
        const response = await axios.get(`http://localhost:5000/api/publicaciones/usuario/${userId}`);
        setPublicaciones(response.data);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError('No pudimos cargar tus publicaciones en este momento.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMisPublicaciones();
  }, []);

  const handleDeletePublicacion = async (id) => {
    if (window.confirm('¿Deseas eliminar esta publicación permanentemente?')) {
      try {
        await axios.delete(`http://localhost:5000/api/publicaciones/${id}`);
        setPublicaciones(publicaciones.filter(pub => pub.id !== id));
      } catch (error) {
        alert('Error al eliminar.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-['Plus_Jakarta_Sans'] pb-20">
      
      {/* HEADER DE GESTIÓN */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-[#5bc0de]/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
              <LayoutGrid size={14} className="text-[#5bc0de]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5bc0de]">Inventario Personal</span>
            </div>
            <h1 className="text-4xl font-[900] text-slate-900 tracking-tighter text-center md:text-left">Mis Publicaciones</h1>
          </div>
          
          <Link 
            to="/form" 
            className="group bg-[#5bc0de] hover:bg-[#46a6c2] text-white px-8 py-4 rounded-[2rem] flex items-center gap-3 transition-all shadow-lg shadow-[#5bc0de]/30 font-black uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> Nueva publicación
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* ESTADO: CARGANDO */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] bg-white/50 rounded-[2.5rem] animate-pulse border border-white" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-12 rounded-[3rem] text-center border border-red-100 max-w-2xl mx-auto">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <p className="text-red-900 font-black text-lg">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-[#5bc0de] font-bold underline">Reintentar conexión</button>
          </div>
        ) : publicaciones.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-xl shadow-slate-200/50"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Tu galería está vacía</h3>
            <p className="text-slate-400 font-medium mb-8">Parece que aún no has subido ningún equipo para reciclar.</p>
            <Link 
              to="/publicar" 
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#5bc0de] transition-colors shadow-xl shadow-slate-200"
            >
              Empezar ahora
            </Link>
          </motion.div>
        ) : (
          /* GRILLA DE PUBLICACIONES */
          <motion.div 
            layout
            className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {publicaciones.map((pub) => (
              <motion.div
                key={pub.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white overflow-hidden hover:shadow-2xl hover:shadow-[#5bc0de]/10 transition-all flex flex-col h-full"
              >
                {/* IMAGEN CON BADGE */}
                <div className="relative h-56 overflow-hidden">
                  {pub.foto ? (
                    <img
                      src={`http://localhost:5000/uploads/${pub.foto}`}
                      alt={pub.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#5bc0de] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">
                    {pub.categoria || 'Tech'}
                  </div>
                </div>
                
                <div className="p-7 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-[900] text-slate-900 leading-tight group-hover:text-[#5bc0de] transition-colors truncate pr-2">
                      {pub.titulo}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">
                    <Calendar size={14} className="text-[#5bc0de]" />
                    <span>{new Date(pub.fecha || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-6">
                    {pub.descripcion}
                  </p>
                  
                  {/* ACCIONES */}
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                    <Link
                      to={`/Detalle/${pub.id}`}
                      className="text-[#5bc0de] hover:text-slate-900 font-black text-[11px] uppercase tracking-widest flex items-center gap-1 transition-colors"
                    >
                      Detalles <ChevronRight size={14} />
                    </Link>
                    
                    <div className="flex gap-2">
                      <Link
                        to={`/editar/${pub.id}`}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-cyan-50 hover:text-[#5bc0de] rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeletePublicacion(pub.id)}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CONSEJOS DE REUSETECH (REDISEÑADO) */}
        <section className="mt-20">
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5bc0de] opacity-5 rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Info className="text-[#5bc0de]" size={28} />
                <h2 className="text-2xl font-black text-white tracking-tight">Optimiza tu impacto</h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {[
                  { n: "01", t: "Fotos Claras", d: "Usa luz natural para que los detalles técnicos se vean perfectos." },
                  { n: "02", t: "Honestidad", d: "Describe el estado real de la batería y pantalla para generar confianza." },
                  { n: "03", t: "Categoriza", d: "Ubicar bien tu equipo ayuda a que los recicladores lo encuentren rápido." }
                ].map((item, idx) => (
                  <div key={idx} className="group">
                    <span className="block text-4xl font-black text-white/10 group-hover:text-[#5bc0de]/20 transition-colors mb-2">{item.n}</span>
                    <h3 className="font-bold text-white mb-2">{item.t}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MisPublicaciones;