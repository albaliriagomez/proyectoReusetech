import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BandejaEntrada = () => {
  const [conversaciones, setConversaciones] = useState([]);
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!usuario) return;
    axios.get(`http://localhost:5000/api/conversaciones/${usuario.id}`)
      .then(res => setConversaciones(res.data))
      .catch(err => console.error('Error al obtener conversaciones:', err));
  }, []);

  const irAlChat = (remitente_id, destinatario_id, publicacion_id) => {
    const otroUsuario = usuario.id === remitente_id ? destinatario_id : remitente_id;
    navigate(`/chat/${usuario.id}/${otroUsuario}/${publicacion_id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-[#5bc0de] mb-4"> Bandeja de entrada</h2>
      {conversaciones.length === 0 ? (
        <p className="text-gray-500">No tienes conversaciones aún.</p>
      ) : (
        <div className="space-y-4">
          {conversaciones.map((conv) => (
            <div
              key={conv.id}
              onClick={() => irAlChat(conv.remitente_id, conv.destinatario_id, conv.publicacion_id)}
              className="cursor-pointer bg-white shadow-md p-4 rounded-lg hover:bg-blue-50 transition"
            >
              <p className="font-semibold">{conv.usuario_nombre}</p>
              <p className="text-sm text-gray-600">Publicación: {conv.publicacion_titulo}</p>
              <p className="text-xs text-gray-400">Último mensaje: {conv.contenido}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BandejaEntrada;
