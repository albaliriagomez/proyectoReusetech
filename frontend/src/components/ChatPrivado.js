import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { 
  Send, ArrowLeft, ShieldCheck, 
  Check, CheckCheck, MoreVertical
} from 'lucide-react';

import { API_BASE_URL } from '../api';
const socket = io(API_BASE_URL);

const ChatPrivado = () => {
  const { usuarioId, emisorId, publicacionId } = useParams();
  const navigate = useNavigate();
  const activeUserId = parseInt(localStorage.getItem('userId'));

  const p1 = parseInt(usuarioId);
  const p2 = parseInt(emisorId);

  // Determinar dinámicamente quién es el remitente y quién el destinatario
  let remitente = p2;
  let destinatario = p1;

  if (activeUserId) {
    if (p1 === activeUserId) {
      remitente = p1;
      destinatario = p2;
    } else {
      remitente = p2;
      destinatario = p1;
    }
  }

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  
  const [contactoName, setContactoName] = useState('');
  const [productoTitle, setProductoTitle] = useState('');
  const [estadoDispositivo, setEstadoDispositivo] = useState('');
  
  // Lista de chats para la columna izquierda
  const [conversaciones, setConversaciones] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);

  const room = `${publicacionId}-${Math.min(remitente, destinatario)}-${Math.max(remitente, destinatario)}`;

  const marcarTodosComoLeidos = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/mensajes/leer/${room}`, { lectorId: remitente });
      socket.emit('messagesRead', { room, lectorId: remitente });
      fetchConversaciones();
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  };

  const fetchConversaciones = async () => {
    try {
      setLoadingChats(true);
      const res = await axios.get(`${API_BASE_URL}/api/conversaciones/${remitente}`);
      setConversaciones(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  const cargarInfoChat = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/mensajes/info-chat/${publicacionId}/${destinatario}`);
      setContactoName(`${res.data.nombre} ${res.data.apellidos || ''}`.trim());
      setProductoTitle(res.data.publicacion_titulo || '');
      setEstadoDispositivo(res.data.publicacion_estado || '');
    } catch (error) { 
      console.error(error); 
    }
  };

  const cargarMensajes = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/mensajes/${publicacionId}/${remitente}/${destinatario}`);
      setMensajes(res.data);
      marcarTodosComoLeidos();
    } catch (error) { 
      console.error(error); 
    } finally { 
      setCargando(false); 
    }
  };

  useEffect(() => {
    // Limpiar cabecera para evitar mostrar datos viejos al cambiar de chat
    setContactoName('');
    setProductoTitle('');
    setEstadoDispositivo('');

    socket.emit('joinUserRoom', { userId: remitente });
    socket.emit('joinRoom', { room });
    
    socket.on('receiveMessage', (mensaje) => {
      if (mensaje.destinatario_id === remitente) {
        mensaje.leido = true;
        marcarTodosComoLeidos();
      }
      setMensajes((prev) => [...prev, mensaje]);
      fetchConversaciones();
    });

    socket.on('conversationUpdate', () => {
      fetchConversaciones();
    });

    socket.on('messagesRead', ({ lectorId }) => {
      if (parseInt(lectorId) !== remitente) {
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.remitente_id === remitente ? { ...msg, leido: true } : msg
          )
        );
      }
    });

    cargarMensajes();
    cargarInfoChat();
    fetchConversaciones();

    return () => { 
      socket.off('receiveMessage'); 
      socket.off('conversationUpdate'); 
      socket.off('messagesRead'); 
    };
  }, [usuarioId, publicacionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = async (e) => {
    e?.preventDefault();
    if (!nuevoMensaje.trim()) return;
    setEnviando(true);
    const mensajeData = {
      remitente_id: remitente,
      destinatario_id: destinatario,
      publicacion_id: publicacionId,
      contenido: nuevoMensaje,
    };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/mensajes`, mensajeData);
      socket.emit('sendMessage', { ...res.data, room });
      setNuevoMensaje('');
      inputRef.current?.focus();
      fetchConversaciones();
    } catch (error) { 
      console.error(error); 
    } finally { 
      setEnviando(false); 
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatearFechaCorta = (fechaStr) => {
    if (!fechaStr) return '';
    const date = new Date(fechaStr);
    const hoy = new Date();
    if (date.toDateString() === hoy.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getSeparadorFecha = (msg, prevMsg) => {
    if (!msg.fecha_envio) return null;
    const dateCurr = new Date(msg.fecha_envio);
    
    if (prevMsg && prevMsg.fecha_envio) {
      const datePrev = new Date(prevMsg.fecha_envio);
      if (dateCurr.toDateString() === datePrev.toDateString()) {
        return null;
      }
    }
    
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    
    if (dateCurr.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (dateCurr.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      const options = { day: 'numeric', month: 'long' };
      // Si el año es anterior al año actual (2026)
      if (dateCurr.getFullYear() < hoy.getFullYear()) {
        return `${dateCurr.toLocaleDateString('es-ES', options)}, ${dateCurr.getFullYear()}`;
      }
      return dateCurr.toLocaleDateString('es-ES', options);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-['Plus_Jakarta_Sans'] flex">
      
      {/* COLUMNA IZQUIERDA: LISTA DE CHATS (Oculta en móvil) */}
      <aside className="hidden lg:flex flex-col w-[320px] bg-white border-r border-[#00b0ca]/10 shrink-0">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-[900] text-slate-800 text-lg">Mensajes</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Conversaciones Activas</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingChats ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-6 h-6 border-3 border-cyan-500/20 border-t-[#00b0ca] rounded-full animate-spin" />
            </div>
          ) : conversaciones.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-8 font-bold">No hay chats activos</p>
          ) : (
            conversaciones.map((conv) => {
              const otroId = remitente === conv.remitente_id ? conv.destinatario_id : conv.remitente_id;
              const isActive = otroId === destinatario && parseInt(conv.publicacion_id) === parseInt(publicacionId);
              const clickUrl = (destinatario === p1)
                ? `/chat/${otroId}/${remitente}/${conv.publicacion_id}` 
                : `/chat/${remitente}/${otroId}/${conv.publicacion_id}`;
              return (
                <div
                  key={conv.id || `${conv.publicacion_id}-${otroId}`}
                  onClick={() => navigate(clickUrl)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-cyan-50/50 border-[#00b0ca]/20 text-slate-800 shadow-sm' 
                      : 'hover:bg-slate-50/80 text-slate-600 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00b0ca] to-[#008ba0] text-white flex items-center justify-center font-black shrink-0 shadow-sm shadow-[#00b0ca]/20">
                    {conv.usuario_nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${isActive ? 'font-bold text-[#00b0ca]' : 'font-bold text-slate-800'}`}>
                        {conv.usuario_nombre}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold whitespace-nowrap shrink-0">
                        {formatearFechaCorta(conv.fecha_envio)}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#00b0ca] font-black truncate mt-0.5 uppercase tracking-wide">
                      {conv.publicacion_titulo}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-[10px] text-slate-400 truncate font-semibold">
                        {conv.contenido || 'Sin mensajes'}
                      </p>
                      {conv.no_leidos > 0 && (
                        <span className="bg-[#00b0ca] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-[16px] text-center">
                          {conv.no_leidos}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* COLUMNA DERECHA: CONVERSACIÓN ACTIVA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7f9] relative">
        
        {/* HEADER CON NUESTRO CELESTE */}
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-[#00b0ca]/10 px-4 py-3 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button 
                onClick={() => navigate('/bandeja')}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1.5 p-2 hover:bg-cyan-50 rounded-xl text-[#00b0ca] transition-colors"
                title="Volver a la lista de chats"
              >
                <ArrowLeft size={20} />
                <span className="text-xs font-black uppercase tracking-wider">Volver</span>
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#00b0ca] to-[#008ba0] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#00b0ca]/30">
                  {(contactoName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 leading-tight text-sm md:text-base">{contactoName || 'Cargando...'}</h2>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mt-0.5">
                    {estadoDispositivo === 'Reciclaje' ? '♻️' : '📂'} {estadoDispositivo === 'Reciclaje' ? 'Coordinando' : 'Interés en'}: <span className="font-semibold text-[#00b0ca] truncate max-w-[150px] sm:max-w-[300px]">{productoTitle || 'Cargando dispositivo...'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="p-2 text-slate-400"><MoreVertical size={20} /></button>
          </div>
        </nav>

        {/* ÁREA DE MENSAJES */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-y-auto flex flex-col">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-20 my-auto">
              <div className="w-8 h-8 border-4 border-[#00b0ca]/20 border-t-[#00b0ca] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 mt-3">Cargando conversación...</p>
            </div>
          ) : mensajes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto my-auto">
              <div className="w-16 h-16 bg-[#00b0ca]/10 rounded-full flex items-center justify-center text-[#00b0ca] mb-4 shadow-inner">
                <ShieldCheck size={36} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Inicio de coordinación segura</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                Por la seguridad de tu hardware y datos, mantén la comunicación dentro de los protocolos de economía circular de ReUseTech.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {mensajes.map((msg, index) => {
                  const esMio = msg.remitente_id === remitente;
                  const prevMsg = index > 0 ? mensajes[index - 1] : null;
                  const separador = getSeparadorFecha(msg, prevMsg);

                  return (
                    <React.Fragment key={msg.id || `msg-${index}`}>
                      {separador && (
                        <div className="flex justify-center my-4">
                          <span className="mx-auto px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full shadow-sm">
                            {separador}
                          </span>
                        </div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                            esMio 
                              ? 'bg-[#00b0ca] text-white rounded-tr-none' 
                              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.contenido}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-2">
                            <span className="text-[10px] font-bold text-slate-400">{formatearFecha(msg.fecha_envio)}</span>
                            {esMio && (
                              msg.leido ? (
                                <CheckCheck size={14} className="text-[#00b0ca]" />
                              ) : (
                                <Check size={14} className="text-slate-300" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>
          )}
        </main>

        {/* INPUT CON NUESTRO CELESTE */}
        <footer className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-20">
          <form 
            onSubmit={enviarMensaje}
            className="max-w-4xl mx-auto flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-slate-50 px-6 py-3 outline-none text-slate-700 text-sm rounded-full border border-slate-200 focus:border-[#00b0ca] focus:ring-1 focus:ring-[#00b0ca] transition-all"
              disabled={enviando}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!nuevoMensaje.trim()}
              className={`p-3 rounded-full transition-all shrink-0 flex items-center justify-center ${
                !nuevoMensaje.trim() 
                  ? 'bg-slate-200 text-slate-400' 
                  : 'bg-[#00b0ca] text-white shadow-md shadow-[#00b0ca]/30 hover:scale-105 active:scale-95 transition-transform'
              }`}
            >
              <Send size={18} />
            </motion.button>
          </form>
          
          {/* REFUERZO DE SEGURIDAD ABAJO */}
          <div className="flex justify-center items-center gap-2 mt-3 text-[#00b0ca] opacity-60">
            <ShieldCheck size={12} />
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Coordinación Segura ReUseTech</span>
          </div>
        </footer>
      </div>

    </div>
  );
};

export default ChatPrivado;