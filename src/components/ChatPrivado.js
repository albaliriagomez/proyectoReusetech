import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import { Send, ArrowLeft, Clock } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatPrivado = () => {
  const { user1, user2, publicacionId } = useParams();
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

    return () => {
      socket.off('receiveMessage');
      socket.disconnect();
    };
  }, [user1, user2, publicacionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const cargarInfoUsuario = async () => {
    try {
      // Asumiendo que tienes un endpoint para obtener información del usuario
      const res = await axios.get(`http://localhost:5000/api/usuarios/${destinatario}`);
      setNombreDestinatario(res.data.nombre || 'Usuario');
    } catch (error) {
      console.error('Error al cargar información del usuario:', error);
    }
  };

  const cargarMensajes = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/mensajes/${publicacionId}/${user1}/${user2}`);
      setMensajes(res.data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setCargando(false);
    }
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
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setEnviando(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 px-4 md:px-6 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 flex items-center shadow-md">
          <motion.button 
            className="mr-3 p-1 rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold">{nombreDestinatario}</h1>
            <p className="text-xs text-blue-100">ID Publicación: {publicacionId}</p>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-blue-50 to-white space-y-4">
          {cargando ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-blue-200 mb-2"></div>
                <div className="h-4 w-24 bg-blue-200 rounded"></div>
              </div>
            </div>
          ) : mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Clock size={48} className="mb-3 opacity-50" />
              <p className="text-center">No hay mensajes aún.<br/>¡Envía el primero!</p>
            </div>
          ) : (
            mensajes.map((msg, index) => {
              const esMio = msg.remitente_id === remitente;
              const mostrarFecha = index === 0 || new Date(msg.fecha_envio).getDate() !== new Date(mensajes[index - 1]?.fecha_envio).getDate();
              
              return (
                <React.Fragment key={msg.id || `msg-${index}`}>
                  {mostrarFecha && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        {new Date(msg.fecha_envio).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-xs md:max-w-md flex flex-col ${
                      esMio ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      esMio 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}>
                      <p className="break-words">{msg.contenido}</p>
                    </div>
                    <div className={`text-xs mt-1 ${esMio ? 'text-gray-500' : 'text-gray-400'} flex items-center`}>
                      {formatearFecha(msg.fecha_envio)}
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* Input Area */}
        <form onSubmit={enviarMensaje} className="bg-white p-4 border-t border-gray-100 shadow-inner">
          <div className="flex items-center bg-gray-50 rounded-full overflow-hidden border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400">
            <input
              ref={inputRef}
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-700"
              disabled={enviando}
            />
            <motion.button
              type="submit"
              className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full mr-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={enviando || !nuevoMensaje.trim()}
            >
              <Send size={20} className={enviando ? "animate-pulse" : ""} />
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatPrivado;