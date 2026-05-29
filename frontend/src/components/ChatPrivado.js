import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { 
  Send, ArrowLeft, Clock, ShieldCheck, 
  Smartphone, Check, MoreVertical 
} from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatPrivado = () => {
  const { user1, user2, publicacionId } = useParams();
  const navigate = useNavigate();
  const remitente = parseInt(user1);
  const destinatario = parseInt(user2);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [nombreDestinatario, setNombreDestinatario] = useState('Usuario');

  const room = `${publicacionId}-${Math.min(remitente, destinatario)}-${Math.max(remitente, destinatario)}`;

  useEffect(() => {
    socket.emit('joinRoom', { room });
    socket.on('receiveMessage', (mensaje) => {
      setMensajes((prev) => [...prev, mensaje]);
    });
    cargarMensajes();
    cargarInfoUsuario();
    return () => { socket.off('receiveMessage'); };
  }, [user1, user2, publicacionId, room]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const cargarInfoUsuario = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/usuarios/${destinatario}`);
      setNombreDestinatario(res.data.nombre || 'Usuario');
    } catch (error) { console.error(error); }
  };

  const cargarMensajes = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/mensajes/${publicacionId}/${user1}/${user2}`);
      setMensajes(res.data);
    } catch (error) { console.error(error); } finally { setCargando(false); }
  };

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
      const res = await axios.post(`http://localhost:5000/api/mensajes`, mensajeData);
      socket.emit('sendMessage', { ...res.data, room });
      setNuevoMensaje('');
      inputRef.current?.focus();
    } catch (error) { console.error(error); } finally { setEnviando(false); }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-['Plus_Jakarta_Sans'] flex flex-col">
      
      {/* HEADER CON NUESTRO CELESTE */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-[#5bc0de]/20 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button 
              onClick={() => navigate(-1)}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-cyan-50 rounded-full text-[#5bc0de] transition-colors"
            >
              <ArrowLeft size={24} />
            </motion.button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#5bc0de] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#5bc0de]/30">
                {nombreDestinatario.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-black text-slate-800 leading-tight">{nombreDestinatario}</h2>
                <div className="flex items-center gap-1 text-[#5bc0de] text-[10px] font-black uppercase tracking-tighter">
                  <Smartphone size={10} /> Publicación #{publicacionId}
                </div>
              </div>
            </div>
          </div>
          <button className="p-2 text-slate-400"><MoreVertical size={20} /></button>
        </div>
      </nav>

      {/* ÁREA DE MENSAJES */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {mensajes.map((msg, index) => {
              const esMio = msg.remitente_id === remitente;
              return (
                <motion.div
                  key={msg.id || `msg-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3 rounded-[1.8rem] shadow-sm ${
                      esMio 
                        ? 'bg-[#5bc0de] text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                    }`}>
                      <p className="text-sm md:text-base font-bold leading-relaxed">{msg.contenido}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-2">
                      <span className="text-[10px] font-bold text-slate-400">{formatearFecha(msg.fecha_envio)}</span>
                      {esMio && <Check size={12} className="text-[#5bc0de]" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* INPUT CON NUESTRO CELESTE */}
      <footer className="bg-white border-t border-slate-100 p-4">
        <form 
          onSubmit={enviarMensaje}
          className="max-w-4xl mx-auto flex items-center gap-2 bg-slate-50 p-1.5 rounded-[2rem] border border-slate-200 focus-within:border-[#5bc0de]/50 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-700 font-bold text-sm"
            disabled={enviando}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!nuevoMensaje.trim()}
            className={`p-3 rounded-full transition-all ${
              !nuevoMensaje.trim() ? 'bg-slate-200 text-slate-400' : 'bg-[#5bc0de] text-white shadow-md shadow-[#5bc0de]/40'
            }`}
          >
            <Send size={20} />
          </motion.button>
        </form>
        
        {/* REFUERZO DE SEGURIDAD ABAJO */}
        <div className="flex justify-center items-center gap-2 mt-3 text-[#5bc0de] opacity-60">
          <ShieldCheck size={12} />
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Coordinación Segura ReUseTech</span>
        </div>
      </footer>
    </div>
  );
};

export default ChatPrivado;