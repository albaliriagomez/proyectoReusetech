import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronRight,
  ArrowUpRight, Calendar, Cpu, Package, TrendingUp, Users,
  Sparkles, Leaf, Globe, Zap, Check, RotateCcw, ArrowUpDown,
  SortAsc, SortDesc, MapPin, Tag, Activity, Filter,
  Smartphone, Laptop, Tablet, Box 
} from 'lucide-react';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://proyectoreusetech-backend.onrender.com';
const LIMIT = 12;

const CATEGORIAS = [
  { value: 'Teléfonos y Accesorios',      emoji: '📱', count: null },
  { value: 'Computadoras y Accesorios',   emoji: '💻', count: null },
  { value: 'Electrodomésticos',           emoji: '🏠', count: null },
  { value: 'Otros',                       emoji: '📦', count: null },
];

const ESTADOS = [
  { value: 'Buen estado', color: '#22c55e', dot: true },
  { value: 'Usado',       color: '#f59e0b', dot: true },
  { value: 'Reciclaje',   color: '#ef4444', dot: true },
];

const opcionesUbicacion = [
  'Cochabamba',
  'Cochabamba-cercado',
  'Quillacollo',
  'Sacaba',
  'Colcapirhua',
  'Tiquipaya',
  'Vinto',
];

const ORDENAR = [
  { value: 'reciente',   label: 'Más recientes',   icon: <SortDesc size={13}/> },
  { value: 'antiguo',    label: 'Más antiguos',     icon: <SortAsc  size={13}/> },
  { value: 'az',         label: 'A → Z',            icon: <SortAsc  size={13}/> },
  { value: 'za',         label: 'Z → A',            icon: <SortDesc size={13}/> },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function buildParams({ busqueda, categorias, estados, ubicaciones, orden, page }) {
  const p = new URLSearchParams();
  if (busqueda)               p.set('q',          busqueda);
  categorias.forEach(c =>     p.append('categoria', c));
  estados.forEach(e =>        p.append('estado',    e));
  ubicaciones.forEach(u =>    p.append('ubicacion', u));
  if (orden)                  p.set('orden',      orden);
  p.set('page',  String(page));
  p.set('limit', String(LIMIT));
  return p;
}

// ─── CHIP DE FILTRO ACTIVO ────────────────────────────────────────────────────
const ActiveChip = ({ label, onRemove }) => (
  <motion.span
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
    style={{ background: 'rgba(49,194,219,0.12)', color: '#31C2DB', border: '1px solid rgba(49,194,219,0.25)' }}
  >
    {label}
    <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
      <X size={11} />
    </button>
  </motion.span>
);

// ─── SECCIÓN COLAPSABLE DEL SIDEBAR ──────────────────────────────────────────
const SidebarSection = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
          <span style={{ color: '#31C2DB' }}>{icon}</span>
          {title}
        </div>
        <ChevronDown
          size={14}
          className="text-slate-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── CARD DE PUBLICACIÓN ──────────────────────────────────────────────────────
const PubCard = ({ pub }) => {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const handleActionClick = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    const concepto = user.rol === 'Gestor_RAEE' ? 'Coordinación de Retiro de RAEE' : 'Solicitar Donación';
    navigate(`/chat/${user.id}/${pub.autor_id}/${pub.id}?concepto=${encodeURIComponent(concepto)}`);
  };

  const getImageSrc = (pub) => {
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

  const imageSrc = getImageSrc(pub);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[1.75rem] overflow-hidden border border-slate-100 shadow-sm group"
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 40px rgba(49,194,219,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
    >
    <Link to={`/Detalle/${pub.id}`} className="block relative overflow-hidden" style={{ height: 200 }}>
      <img
        src={imageSrc}
        alt={pub.titulo || 'Publicación'}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        <span className="text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.92)', color: '#0f172a', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {pub.categoria || 'General'}
        </span>
        {pub.estado && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1"
            style={{ background: 'rgba(255,255,255,0.92)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: ESTADOS.find(e => e.value === pub.estado)?.color || '#94a3b8' }} />
            {pub.estado}
          </span>
        )}
      </div>
    </Link>

    <div className="p-5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold mb-2 uppercase tracking-widest" style={{ color: '#31C2DB' }}>
        <Calendar size={11} />
        {new Date(pub.fecha || Date.now()).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
        {pub.ubicacion && (
          <>
            <span className="text-slate-200 mx-1">•</span>
            <MapPin size={11} />
            {pub.ubicacion}
          </>
        )}
      </div>

      <Link to={`/Detalle/${pub.id}`}>
        <h3 className="text-base font-[800] text-slate-800 leading-snug transition-colors line-clamp-2"
          onMouseEnter={e => (e.target.style.color = '#31C2DB')}
          onMouseLeave={e => (e.target.style.color = '')}>
          {pub.titulo}
        </h3>
      </Link>

      <p className="text-slate-500 text-sm mt-2 line-clamp-2 font-medium leading-relaxed">
        {pub.descripcion}
      </p>

      {/* ── Badge de impacto ambiental ───────────────────────── */}
      {pub.impacto_ambiental && (
        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl w-fit"
          style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
          <Leaf size={11} style={{ color: '#16a34a' }} />
          <span className="text-[10px] font-black tracking-wide" style={{ color: '#16a34a' }}>
            {pub.impacto_ambiental.co2_evitado} kg CO₂ · ~{pub.impacto_ambiental.arboles_equivalentes} árbol{pub.impacto_ambiental.arboles_equivalentes !== 1 ? 'es' : ''} salvados
          </span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <Link to={`/Detalle/${pub.id}`}
          className="flex items-center gap-1 text-xs font-[900] text-slate-800 uppercase tracking-tight group-hover:gap-2 transition-all">
          Ver más <ChevronRight size={14} style={{ color: '#31C2DB' }} />
        </Link>
        <button 
          onClick={handleActionClick}
          className="p-2 rounded-full transition-colors"
          style={{ background: 'rgba(49,194,219,0.06)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(49,194,219,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(49,194,219,0.06)')}>
          <ArrowUpRight size={16} style={{ color: '#31C2DB' }} />
        </button>
      </div>
    </div>
  </motion.div>
  );
};

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-[1.75rem] overflow-hidden border border-slate-100">
    <div className="h-48 bg-slate-100 animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
      <div className="h-5 w-3/4 bg-slate-100 rounded-full animate-pulse" />
      <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse" />
      <div className="h-3 w-2/3 bg-slate-100 rounded-full animate-pulse" />
    </div>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const MainPage = () => {
  const navigate = useNavigate();
  // Estados de filtro
  const [busqueda,         setBusqueda]         = useState('');
  const [categoriasActivas, setCategoriasActivas] = useState([]);
  const [estadosActivos,    setEstadosActivos]   = useState([]);
  const [ubicacionesActivas, setUbicacionesActivas] = useState([]);
  const [orden,             setOrden]            = useState('reciente');
  const [sidebarOpen,       setSidebarOpen]      = useState(true);
  const [sortOpen,          setSortOpen]         = useState(false);
  const [mobileDrawerOpen,  setMobileDrawerOpen] = useState(false);

  const renderFiltersContent = () => (
    <>
      {/* Header sidebar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} style={{ color: '#31C2DB' }} />
          <span className="font-[900] text-slate-800 text-sm">Filtros</span>
          {activeCount > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white bg-[#31C2DB]">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={resetAll}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors">
            <RotateCcw size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* Categorías */}
      <SidebarSection title="Categoría" icon={<Tag size={12}/>}>
        <div className="space-y-1.5">
          {[
            { label: "Teléfonos y Accesorios", value: "Teléfonos y Accesorios", icon: <Smartphone size={14} /> },
            { label: "Computadoras y Accesorios", value: "Computadoras y Accesorios", icon: <Laptop size={14} /> },
            { label: "Tablets y Accesorios", value: "Tablets y Accesorios", icon: <Tablet size={14} /> },
            { label: "Otros", value: "Otros", icon: <Box size={14} /> }
          ].map(cat => {
            const active = categoriasActivas.includes(cat.value);
            return (
              <button 
                key={cat.value} 
                onClick={() => toggleArr(categoriasActivas, setCategoriasActivas, cat.value)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={active
                  ? { background: 'rgba(49,194,219,0.10)', color: '#31C2DB', border: '1.5px solid rgba(49,194,219,0.25)' }
                  : { background: 'transparent', color: '#475569', border: '1.5px solid transparent' }}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex-shrink-0 ${active ? 'text-[#31C2DB]' : 'text-slate-400'}`}>
                    {cat.icon}
                  </span>
                  <span className="text-xs font-bold text-left">{cat.label}</span>
                </div>
                {active && <Check size={13} style={{ color: '#31C2DB' }} />}
              </button>
            );
          })}
        </div>
      </SidebarSection>

      {/* Estado */}
      <SidebarSection title="Estado" icon={<Activity size={12}/>}>
        <div className="space-y-1.5">
          {ESTADOS.map(est => {
            const active = estadosActivos.includes(est.value);
            return (
              <button key={est.value} onClick={() => toggleArr(estadosActivos, setEstadosActivos, est.value)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={active
                  ? { background: `${est.color}15`, color: est.color, border: `1.5px solid ${est.color}40` }
                  : { background: 'transparent', color: '#475569', border: '1.5px solid transparent' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: est.color }} />
                  {est.value}
                </div>
                {active && <Check size={13} style={{ color: est.color }} />}
              </button>
            );
          })}
        </div>
      </SidebarSection>

      {/* Ubicación */}
      <SidebarSection title="Ubicación" icon={<MapPin size={12}/>}>
        <div className="space-y-1.5">
          {["Cochabamba", "Cochabamba-cercado", "Quillacollo", "Sacaba", "Colcapirhua", "Tiquipaya", "Vinto"].map((loc) => {
            const active = ubicacionesActivas.includes(loc);
            const themeColor = "#008080"; 

            return (
              <button 
                key={loc} 
                onClick={() => toggleArr(ubicacionesActivas, setUbicacionesActivas, loc)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={active
                  ? { background: `${themeColor}15`, color: themeColor, border: `1.5px solid ${themeColor}40` }
                  : { background: 'transparent', color: '#475569', border: '1.5px solid transparent' }}
              >
                <div className="flex items-center gap-2 text-left">
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ background: active ? themeColor : '#cbd5e1' }} 
                  />
                  {loc}
                </div>
                {active && <Check size={13} style={{ color: themeColor }} />}
              </button>
            );
          })}
        </div>
      </SidebarSection>

      {/* CTA footer sidebar */}
      <div className="mt-4 pt-4 border-t border-slate-50">
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(49,194,219,0.06)' }}>
          <Leaf size={18} className="mx-auto mb-2" style={{ color: '#31C2DB' }} />
          <p className="text-xs font-bold text-slate-600">Economía Circular</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Cada equipo cuenta</p>
        </div>
      </div>
    </>
  );

  // Paginación / datos
  const [publicaciones, setPublicaciones] = useState([]);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(true);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [total,         setTotal]         = useState(0);

  const debouncedBusqueda = useDebounce(busqueda, 350);
  const loaderRef = useRef(null);
  const sortRef   = useRef(null);

  // Cierra dropdown al click fuera
  useEffect(() => {
    const fn = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Fetch con reset al cambiar filtros
  const fetchPublicaciones = useCallback(async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    if (resetPage) { setLoading(true); setPublicaciones([]); setPage(1); setHasMore(true); }
    else setLoadingMore(true);

    try {
      const params = buildParams({
        busqueda: debouncedBusqueda,
        categorias: categoriasActivas,
        estados:    estadosActivos,
        ubicaciones: ubicacionesActivas,
        orden,
        page: currentPage,
      });

      const { data } = await axios.get(`${API}/api/publicaciones?${params}`);

      // El backend devuelve { rows, total } o array legacy
      const rows  = Array.isArray(data) ? data : (data.rows  ?? []);
      const count = Array.isArray(data) ? null  : (data.total ?? null);

      if (count !== null) setTotal(count);

      setPublicaciones(prev => resetPage ? rows : [...prev, ...rows]);
      setHasMore(rows.length === LIMIT);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedBusqueda, categoriasActivas, estadosActivos, ubicacionesActivas, orden, page]);

  // Reset cuando cambian filtros
  useEffect(() => { fetchPublicaciones(true); },
    [debouncedBusqueda, categoriasActivas, estadosActivos, ubicacionesActivas, orden]);

  // Carga más al hacer scroll (Intersection Observer)
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) setPage(p => p + 1); },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  useEffect(() => { if (page > 1) fetchPublicaciones(false); }, [page]);

  // Toggle helpers
  const toggleArr = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const resetAll = () => {
    setBusqueda('');
    setCategoriasActivas([]);
    setEstadosActivos([]);
    setUbicacionesActivas([]);
    setOrden('reciente');
  };

  const activeCount =
    categoriasActivas.length + estadosActivos.length + ubicacionesActivas.length +
    (debouncedBusqueda ? 1 : 0);

  const activeChips = [
    ...(debouncedBusqueda ? [{ label: `"${debouncedBusqueda}"`, onRemove: () => setBusqueda('') }] : []),
    ...categoriasActivas.map(c => ({ label: c, onRemove: () => toggleArr(categoriasActivas, setCategoriasActivas, c) })),
    ...estadosActivos.map(e   => ({ label: e, onRemove: () => toggleArr(estadosActivos,    setEstadosActivos,    e) })),
    ...ubicacionesActivas.map(u => ({ label: u, onRemove: () => toggleArr(ubicacionesActivas, setUbicacionesActivas, u) })),
  ];

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const equiposVisibles = publicaciones.filter(equipo => {
    if (user && user.rol === 'Gestor_RAEE') {
      // Las empresas de reciclaje técnico SOLO ven equipos destinados a la minería urbana
      return equipo.estado === 'Reciclaje';
    } else {
      // Los usuarios particulares y las Fundaciones/Escuelas SOLO ven equipos funcionales
      return equipo.estado === 'Buen estado' || equipo.estado === 'Usado';
    }
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen font-['Plus_Jakarta_Sans'] w-full max-w-full overflow-x-hidden">

      {/* ── HERO ────────────────────────────────────────────────── */}
      <div className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="absolute top-[-40%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none"
          style={{ background: '#31C2DB' }} />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-10 pb-0 relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 border"
            style={{ background: 'rgba(49,194,219,0.08)', borderColor: 'rgba(49,194,219,0.25)', color: '#31C2DB' }}>
            <Sparkles size={13} /> Equipos para una segunda vida
          </motion.div>

          <div className="flex flex-col lg:flex-row justify-between items-end gap-6 pb-5">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-[900] text-slate-900 tracking-tight leading-tight">
                Explorar <span style={{ color: '#31C2DB' }}>Tecnología</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium text-base sm:text-lg">
                {total > 0 ? `${total.toLocaleString()} equipos disponibles` : 'Encuentra equipos listos para brillar de nuevo'}
              </p>
            </div>

            {/* Buscador principal */}
            <div className="w-full lg:w-[520px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
                style={{ color: busqueda ? '#31C2DB' : undefined }} size={18} />
              <input
                type="text"
                placeholder="Buscar por título, descripción, marca..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all border-2"
                style={{ borderColor: busqueda ? 'rgba(49,194,219,0.35)' : 'transparent' }}
                onFocus={e  => (e.target.style.borderColor = 'rgba(49,194,219,0.35)')}
                onBlur={e   => (e.target.style.borderColor = busqueda ? 'rgba(49,194,219,0.35)' : 'transparent')}
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-4 border-b border-slate-50">
            {[
              { icon: <Package size={13} />, label: `${equiposVisibles.length} cargados` },
              { icon: <TrendingUp size={13} />, label: 'Actualizado hoy' },
              { icon: <Users size={13} />, label: '+10k usuarios' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span style={{ color: '#31C2DB' }}>{s.icon}</span>{s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL ───────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 flex gap-8">

        {/* ── SIDEBAR FILTROS (Desktop) ───────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden md:block flex-shrink-0 overflow-hidden"
              style={{ width: 300 }}
            >
              <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sticky top-6 shadow-sm"
                style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                {renderFiltersContent()}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── CONTENIDO PRINCIPAL ─────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              {/* Toggle sidebar */}
              <button onClick={() => setSidebarOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all"
                style={sidebarOpen
                  ? { background: '#31C2DB', color: 'white', boxShadow: '0 4px 14px rgba(49,194,219,0.30)' }
                  : { background: 'white', color: '#64748b', border: '1.5px solid #e2e8f0' }}>
                <Filter size={13} />
                {sidebarOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
                {activeCount > 0 && !sidebarOpen && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                    style={{ background: 'rgba(255,255,255,0.3)' }}>
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Resultado count */}
              <span className="text-xs font-bold text-slate-400">
                {loading ? '...' : `${equiposVisibles.length}${total ? ` de ${total.toLocaleString()}` : ''} equipos`}
              </span>
            </div>

            {/* Ordenar dropdown */}
            <div className="relative" ref={sortRef}>
              <button onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-xs font-black text-slate-700 border border-slate-200 hover:border-slate-300 transition-all">
                <ArrowUpDown size={13} style={{ color: '#31C2DB' }} />
                {ORDENAR.find(o => o.value === orden)?.label}
                <ChevronDown size={12} style={{ transform: sortOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden"
                    style={{ minWidth: 180 }}>
                    {ORDENAR.map(op => (
                      <button key={op.value}
                        onClick={() => { setOrden(op.value); setSortOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50"
                        style={{ color: orden === op.value ? '#31C2DB' : '#475569' }}>
                        {op.icon}
                        {op.label}
                        {orden === op.value && <Check size={12} className="ml-auto" style={{ color: '#31C2DB' }} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chips de filtros activos */}
          <AnimatePresence>
            {activeChips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-5">
                {activeChips.map((chip, i) => (
                  <ActiveChip key={i} label={chip.label} onRemove={chip.onRemove} />
                ))}
                {activeChips.length > 1 && (
                  <button onClick={resetAll}
                    className="text-xs font-black px-3 py-1.5 rounded-full text-red-400 border border-red-100 hover:bg-red-50 transition-colors">
                    Limpiar todo
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : equiposVisibles.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(49,194,219,0.08)' }}>
                <Search size={32} style={{ color: '#31C2DB' }} />
              </div>
              <p className="text-slate-600 text-lg font-bold">Sin resultados</p>
              <p className="text-slate-400 text-sm font-medium mt-1">Intenta con otros filtros o búsqueda</p>
              <button onClick={resetAll}
                className="mt-5 text-xs font-black uppercase tracking-widest hover:underline"
                style={{ color: '#31C2DB' }}>
                Limpiar filtros
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {equiposVisibles.map(pub => <PubCard key={pub.id} pub={pub} />)}
                </AnimatePresence>
              </motion.div>

              {/* Loader infinito */}
              <div ref={loaderRef} className="flex justify-center mt-8 h-16 items-center">
                {loadingMore && (
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                    <div className="w-6 h-6 border-3 border-t-[#31C2DB] rounded-full animate-spin"
                      style={{ border: '3px solid rgba(49,194,219,0.15)', borderTopColor: '#31C2DB' }} />
                    Cargando más...
                  </div>
                )}
                {!hasMore && equiposVisibles.length > 0 && (
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                    ✓ Todos los equipos cargados
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* BOTÓN FLOTANTE DE FILTROS EN MÓVIL */}
      <button
        onClick={() => setMobileDrawerOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-[#31C2DB] text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
        style={{ boxShadow: '0 8px 30px rgba(49,194,219,0.4)' }}
      >
        <Filter size={20} />
        <span className="text-xs font-black uppercase tracking-wider">Filtros</span>
        {activeCount > 0 && (
          <span className="bg-white text-[#31C2DB] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {activeCount}
          </span>
        )}
      </button>

      {/* DRAWER DE FILTROS EN MÓVIL */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-[2.5rem] shadow-2xl z-50 p-6 overflow-y-auto md:hidden"
            >
              {/* Handle bar to pull down */}
              <div 
                className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 cursor-pointer" 
                onClick={() => setMobileDrawerOpen(false)} 
              />
              {renderFiltersContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MainPage;