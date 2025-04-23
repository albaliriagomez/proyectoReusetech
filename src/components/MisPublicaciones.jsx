import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MisPublicaciones = () => {
  const { id } = useParams();
  const [publicaciones, setPublicaciones] = useState([]);

  useEffect(() => {
    const fetchMisPublicaciones = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/publicaciones/usuario/${id}`);
        setPublicaciones(response.data);
      } catch (error) {
        console.error("Error al obtener publicaciones:", error);
      }
    };
    fetchMisPublicaciones();
  }, [id]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Mis publicaciones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {publicaciones.map((pub) => (
          <div key={pub.id} className="border p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{pub.titulo}</h3>
            <p>{pub.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisPublicaciones;
