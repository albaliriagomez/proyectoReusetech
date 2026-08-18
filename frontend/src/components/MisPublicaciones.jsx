import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Calendar, Edit3, Trash2, Plus,
  ChevronRight, Info,
  AlertCircle, LayoutGrid, Image as ImageIcon,
  Heart, CheckCircle, X, Users, Leaf
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://proyectoreusetech-backend.onrender.com';

// ─── Estado inicial del modal de donación ────────────────────────────────────
const MODAL_INITIAL = {
  open:              false,
  pub:               null,
  comentadores:      [],
  loadingComentadores: false,
  selectedReceptorId:  null,
  confirmando:       false,
};

const getImagenUrl = (pub) => {
  if (!pub) return '/placeholder.png';
  const img = pub.imagen_url || pub.imagen || pub.foto || pub.imagenUrl || pub.foto_url || pub.image;
  if (!img) return '/placeholder.png';
  if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:'))) {
    return img;
  }
  if (typeof img === 'string' && img.startsWith('/uploads/')) {
    return `${API}${img}`;
  }
  if (typeof img === 'string' && img.startsWith('/')) {
    return `${API}${img}`;
  }
  return `${API}/uploads/${img}`;
};

const MisPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState(null);
  const [donarModal,    setDonarModal]    = useState(MODAL_INITIAL);

  // ── Carga de publicaciones del usuario ──────────────────────────────────────
  useEffect(() => {
    const fetchMisPublicaciones = async () => {
      setIsLoading(true);

      // Leer userId de localStorage — guardado por Login.js tras autenticarse
      // Fallback: intentar extraerlo del objeto user completo si existe
      const userId =
        localStorage.getItem('userId') ||
        (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').id; } catch { return null; } })();

      if (!userId) {
        setError('Debes iniciar sesión para ver tus publicaciones.');
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/api/publicaciones/usuario/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setPublicaciones(response.data);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('No pudimos cargar tus publicaciones en este momento.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMisPublicaciones();
  }, []);

  // ── Eliminar publicación ────────────────────────────────────────────────────
  const handleDeletePublicacion = async (id) => {
    if (window.confirm('¿Deseas eliminar esta publicación permanentemente?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API}/api/publicaciones/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setPublicaciones(prev => prev.filter(pub => pub.id !== id));
      } catch {
        alert('Error al eliminar.');
      }
    }
  };

  // ── Abrir modal de donación: carga los comentaristas únicos ────────────────
  const abrirModalDonar = async (pub) => {
    setDonarModal({ ...MODAL_INITIAL, open: true, pub, loadingComentadores: true });
    try {
      const { data } = await axios.get(`${API}/api/comentarios/${pub.id}`);
      // Extraer usuarios únicos por autor_id
      const mapa = new Map();
      data.forEach(c => {
        if (!mapa.has(c.autor_id)) mapa.set(c.autor_id, { autor_id: c.autor_id, nombre: c.nombre });
      });
      setDonarModal(prev => ({
        ...prev,
        comentadores:      Array.from(mapa.values()),
        loadingComentadores: false,
      }));
    } catch {
      setDonarModal(prev => ({ ...prev, loadingComentadores: false }));
    }
  };

  const cerrarModal = () => setDonarModal(MODAL_INITIAL);

  // ── Confirmar donación ──────────────────────────────────────────────────────
  const handleConfirmarDonacion = async () => {
    if (!donarModal.selectedReceptorId) return;
    setDonarModal(prev => ({ ...prev, confirmando: true }));
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API}/api/publicaciones/${donarModal.pub.id}/donar`,
        { usuario_receptor_id: donarModal.selectedReceptorId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      // Actualizar la publicación en el estado local con el row devuelto
      setPublicaciones(prev =>
        prev.map(p => p.id === donarModal.pub.id ? data.data : p)
      );
      cerrarModal();
    } catch {
      alert('Hubo un error al confirmar la donación. Intenta de nuevo.');
      setDonarModal(prev => ({ ...prev, confirmando: false }));
    }
  };

  // ── Helpers de UI ───────────────────────────────────────────────────────────
  const esDonado = (pub) => pub.estado === 'Donado';

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-['Plus_Jakarta_Sans'] pb-20">

      {/* HEADER */}
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
            <button onClick={() => window.location.reload()} className="mt-4 text-[#5bc0de] font-bold underline">
              Reintentar conexión
            </button>
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
          <motion.div layout className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {publicaciones.map((pub) => (
              <motion.div
                key={pub.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white overflow-hidden hover:shadow-2xl hover:shadow-[#5bc0de]/10 transition-all flex flex-col h-full"
              >
                {/* IMAGEN */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getImagenUrl(pub)}
                    alt={pub.titulo || 'Publicación'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                  />

                  {/* Badge de categoría */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#5bc0de] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">
                    {pub.categoria || 'Tech'}
                  </div>

                  {/* Overlay "Donado" */}
                  {esDonado(pub) && (
                    <div className="absolute inset-0 bg-emerald-900/60 flex flex-col items-center justify-center gap-2">
                      <CheckCircle size={40} className="text-emerald-300" />
                      <span className="text-white font-black text-sm uppercase tracking-widest">Donado</span>
                    </div>
                  )}
                </div>

                <div className="p-7 flex-grow flex flex-col">
                  <h3 className="text-xl font-[900] text-slate-900 leading-tight group-hover:text-[#5bc0de] transition-colors truncate pr-2 mb-3">
                    {pub.titulo}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">
                    <Calendar size={14} className="text-[#5bc0de]" />
                    <span>{new Date(pub.fecha || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-4">
                    {pub.descripcion}
                  </p>

                  {/* Badge de impacto ambiental */}
                  {pub.impacto_ambiental && (
                    <div className="mb-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl w-fit"
                      style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
                      <Leaf size={11} style={{ color: '#16a34a' }} />
                      <span className="text-[10px] font-black tracking-wide" style={{ color: '#16a34a' }}>
                        {pub.impacto_ambiental.co2_evitado} kg CO₂ · ~{pub.impacto_ambiental.arboles_equivalentes} árbol{pub.impacto_ambiental.arboles_equivalentes !== 1 ? 'es' : ''} salvados
                      </span>
                    </div>
                  )}

                  {/* ACCIONES */}
                  <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-50">

                    {/* Botón "Marcar como Donado" — solo para publicaciones activas */}
                    {!esDonado(pub) && (
                      <button
                        onClick={() => abrirModalDonar(pub)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                        style={{ background: 'rgba(34,197,94,0.09)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.09)')}
                      >
                        <Heart size={14} /> Marcar como Donado
                      </button>
                    )}

                    <div className="flex items-center justify-between">
                      <Link
                        to={`/Detalle/${pub.id}`}
                        className="text-[#5bc0de] hover:text-slate-900 font-black text-[11px] uppercase tracking-widest flex items-center gap-1 transition-colors"
                      >
                        Detalles <ChevronRight size={14} />
                      </Link>

                      <div className="flex gap-2">
                        {!esDonado(pub) && (
                          <Link
                            to={`/editar/${pub.id}`}
                            className="p-3 bg-slate-50 text-slate-400 hover:bg-cyan-50 hover:text-[#5bc0de] rounded-xl transition-all"
                            title="Editar"
                          >
                            <Edit3 size={18} />
                          </Link>
                        )}
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
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CONSEJOS */}
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
                  { n: '01', t: 'Fotos Claras',  d: 'Usa luz natural para que los detalles técnicos se vean perfectos.' },
                  { n: '02', t: 'Honestidad',    d: 'Describe el estado real de la batería y pantalla para generar confianza.' },
                  { n: '03', t: 'Categoriza',    d: 'Ubicar bien tu equipo ayuda a que los recicladores lo encuentren rápido.' },
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

      {/* ── MODAL DE DONACIÓN ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {donarModal.open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={cerrarModal}
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit={{    scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Cabecera del modal */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <Heart size={16} style={{ color: '#16a34a' }} />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Confirmar Donación</h2>
                </div>
                <button onClick={cerrarModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <p className="text-slate-500 text-sm mb-5">
                ¿A quién le donas{' '}
                <span className="font-bold text-slate-700">"{donarModal.pub?.titulo}"</span>?
                Selecciona uno de los usuarios que comentaron esta publicación.
              </p>

              {/* Lista de comentaristas */}
              {donarModal.loadingComentadores ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : donarModal.comentadores.length === 0 ? (
                <div className="text-center py-8 rounded-2xl"
                  style={{ background: 'rgba(148,163,184,0.06)', border: '1px dashed rgba(148,163,184,0.3)' }}>
                  <Users size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm font-medium">
                    Ningún usuario ha comentado esta publicación aún.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {donarModal.comentadores.map(c => (
                    <button
                      key={c.autor_id}
                      onClick={() => setDonarModal(prev => ({ ...prev, selectedReceptorId: c.autor_id }))}
                      className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3"
                      style={{
                        borderColor: donarModal.selectedReceptorId === c.autor_id
                          ? '#5bc0de' : 'rgba(226,232,240,1)',
                        background: donarModal.selectedReceptorId === c.autor_id
                          ? 'rgba(91,192,222,0.07)' : 'white',
                      }}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ background: 'rgba(91,192,222,0.12)', color: '#5bc0de' }}>
                        {c.nombre?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{c.nombre}</span>
                      {donarModal.selectedReceptorId === c.autor_id && (
                        <CheckCircle size={16} className="ml-auto flex-shrink-0" style={{ color: '#5bc0de' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarDonacion}
                  disabled={!donarModal.selectedReceptorId || donarModal.confirmando}
                  className="flex-1 py-3 rounded-xl font-black text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: donarModal.confirmando ? '#94a3b8' : '#16a34a' }}
                >
                  {donarModal.confirmando ? 'Confirmando…' : '✓ Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MisPublicaciones;
