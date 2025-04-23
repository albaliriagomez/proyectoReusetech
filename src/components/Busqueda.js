import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Busqueda = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: '',
    estado: '',
    ubicacion: ''
  });

  const navigate = useNavigate();
  const limit = 6;

  const obtenerPublicaciones = async (reset = false) => {
    try {
      // 💡 Solo manda filtros con valores no vacíos
      const filtrosLimpiados = Object.fromEntries(
        Object.entries(filtros).filter(([_, valor]) => valor.trim() !== '')
      );
  
      const res = await axios.get('http://localhost:5000/api/publicaciones', {
        params: {
          page,
          limit,
          ...filtrosLimpiados
        }
      });
  
      if (res.data.length < limit) setHasMore(false);
      setPublicaciones(prev => reset ? res.data : [...prev, ...res.data]);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
    }
  };
  

  useEffect(() => {
    obtenerPublicaciones();
  }, [page]);

  const aplicarFiltros = () => {
    setPage(1);
    setHasMore(true);
    obtenerPublicaciones(true);
  };

  const irADetalle = (id) => {
    navigate(`/detalle/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-[#5bc0de]"> Buscar dispositivos</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
      <select onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })} className="border p-2 rounded">
            <option value="">Todas las categorías</option>
            <option value="Teléfonos y Accesorios">Teléfonos y Accesorios</option>
            <option value="Computadoras y Accesorios">Computadoras y Accesorios</option>
            <option value="Electrodomésticos">Electrodomésticos</option>
            <option value="Otros">Otros</option>
            </select>

            <select onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })} className="border p-2 rounded">
            <option value="">Todos los estados</option>
            <option value="Usado">Usado</option>
            <option value="Buen estado">Buen estado</option>
            <option value="Reciclaje">Reciclaje</option>
            </select>

            <select onChange={(e) => setFiltros({ ...filtros, ubicacion: e.target.value })} className="border p-2 rounded">
            <option value="">Todas las ubicaciones</option>
            <option value="Cochabamba">Cochabamba</option>
            <option value="Cochabamba-cercado">Cochabamba-cercado</option>
            <option value="Quillacollo">Quillacollo</option>
            <option value="Sacaba">Sacaba</option>
            </select>

        <button onClick={aplicarFiltros} className="bg-[#5bc0de] text-white px-4 py-2 rounded hover:bg-[#31a6c4]">
          Aplicar Filtros
        </button>
      </div>

      {/* Resultados */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {publicaciones.map((publi) => (
          <div
            key={publi.id}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
            onClick={() => irADetalle(publi.id)}
          >
            {publi.foto && (
              <img
                src={`http://localhost:5000/uploads/${publi.foto}`}
                alt={publi.titulo}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h4 className="text-lg font-semibold text-[#0099cc]">{publi.titulo}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {publi.descripcion.length > 100 ? publi.descripcion.slice(0, 100) + '...' : publi.descripcion}
              </p>
              <div className="text-xs mt-2 text-gray-500">
                {publi.categoria} • {publi.estado} • {publi.ubicacion}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón Ver más */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-2 bg-[#5bc0de] hover:bg-[#31a6c4] text-white rounded"
          >
            Ver más resultados
          </button>
        </div>
      )}
    </div>
  );
};

export default Busqueda;
