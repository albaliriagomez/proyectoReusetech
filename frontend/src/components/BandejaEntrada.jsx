import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Inbox, ChevronRight, Clock, 
  Smartphone, ShieldCheck, CheckCircle2,
  AlertCircle, Loader2
} from 'lucide-react';

const BandejaEntrada = () => {
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('user'));

  const fetchConversaciones = useCallback(async () => {
    if (!usuario?.id) return;
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://proyectoreusetech-backend.onrender.com';
      const res = await axios.get(`${backendUrl}/api/conversaciones/${usuario.id}`);
      setConversaciones(res.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
      setError('No pudimos conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    fetchConversaciones();
  }, [fetchConversaciones]);

  const irAlChat = (remitente_id, destinatario_id, publicacion_id) => {
    const otroUsuarioId = usuario.id === remitente_id ? destinatario_id : remitente_id;
    navigate(`/chat/${usuario.id}/${otroUsuarioId}/${publicacion_id}`);
  };

  const filtradas = conversaciones.filter(c => 
    c.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.publicacion_titulo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Reciente';
    const d = new Date(fecha);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] pb-24 font-['Plus_Jakarta_Sans'] relative">
      
      {/* DECORACIÓN DE FONDO CON NUESTRO CELESTE */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-[#5bc0de]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[25%] h-[25%] bg-blue-100/30 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#5bc0de] w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(91,192,222,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5bc0de]">Mensajería ReUseTech</span>
            </div>
            <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter">Bandeja</h2>
          </div>

          <div className="relative group w-full md:w-72">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${busqueda ? 'text-[#5bc0de]' : 'text-slate-400'}`} size={18} />
            <input 
              type="text"
              placeholder="Buscar chat o producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-md border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-[#5bc0de]/10 font-bold text-slate-700 transition-all placeholder:text-slate-400 text-sm"
            />
          </div>
        </header>

        {/* LISTADO */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/40 p-6 rounded-[2.5rem] flex gap-4 animate-pulse border border-white/50">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-[2.5rem] text-center border border-red-100">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
            <p className="text-red-800 font-black">{error}</p>
            <button onClick={fetchConversaciones} className="mt-4 text-sm font-bold text-red-600 underline">Reintentar</button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtradas.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/30 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Inbox size={50} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-black text-slate-800">No hay chats</h3>
                <p className="text-slate-500 font-medium">Tus conversaciones aparecerán aquí.</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filtradas.map((conv, index) => (
                  <motion.div
                    key={`${conv.id}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => irAlChat(conv.remitente_id, conv.destinatario_id, conv.publicacion_id)}
                    className="group bg-white/70 hover:bg-white p-5 rounded-[2.5rem] border border-white/50 shadow-sm hover:shadow-xl hover:shadow-[#5bc0de]/10 transition-all cursor-pointer flex items-center gap-5 active:scale-[0.98]"
                  >
                    {/* AVATAR CON NUESTRO CELESTE */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-[1.3rem] bg-gradient-to-br from-[#5bc0de] to-[#46a6c2] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#5bc0de]/20 group-hover:scale-105 transition-transform">
                        {conv.usuario_nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -top-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-[4px] border-white shadow-sm" />
                    </div>

                    {/* CONTENIDO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-black text-slate-900 text-lg truncate tracking-tight">{conv.usuario_nombre}</h4>
                          <CheckCircle2 size={16} className="text-[#5bc0de] shrink-0" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ml-2">
                          {formatearFecha(conv.fecha)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5bc0de]/10 text-[#5bc0de] rounded-full border border-[#5bc0de]/20">
                          <Smartphone size={12} className="shrink-0" />
                          <span className="text-[9px] font-black truncate uppercase tracking-wider leading-none">
                            {conv.publicacion_titulo}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-500 text-sm font-bold line-clamp-1 group-hover:text-slate-800 transition-colors">
                        {conv.contenido || "Enviado un mensaje..."}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#5bc0de] group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* FOOTER CON NUESTRO CELESTE */}
        <footer className="mt-12 p-8 bg-slate-900 rounded-[3rem] relative overflow-hidden group shadow-2xl shadow-slate-900/20">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#5bc0de] opacity-10 rounded-full blur-3xl group-hover:opacity-25 transition-all duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#5bc0de] rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-[#5bc0de] shrink-0 border border-white/10 relative z-10">
                <ShieldCheck size={36} strokeWidth={1.5} />
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="w-8 h-[2px] bg-[#5bc0de]/50 rounded-full hidden md:block" />
                <p className="text-[#5bc0de] font-black text-xs uppercase tracking-[0.3em]">Consejo ReUseTech</p>
              </div>
              <h4 className="text-white font-bold text-lg mb-1 italic">"Coordina entregas en lugares públicos"</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                Para tu seguridad y tranquilidad, te recomendamos encontrarte en sitios concurridos y durante el día. ¡Hagamos del reciclaje una experiencia segura!
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BandejaEntrada;