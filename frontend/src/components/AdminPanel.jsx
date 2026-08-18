import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AnaliticaPredictiva from './AnaliticaPredictiva';
import {
  LayoutDashboard, Users, Package, MessageSquare, Settings,
  Trash2, Eye, EyeOff, Search, RefreshCw,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  XCircle, Shield, LogOut, Activity,
  ArrowUpRight, UserCheck, UserX, Cpu,
  Globe, ChevronLeft, Menu, MapPin, Leaf, TreePine, Handshake
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://proyectoreusetech-backend.onrender.com';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt     = (n) => Number(n || 0).toLocaleString('es-BO');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-BO',  { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : '—';

const ESTADO_COLOR = { 'Buen estado': '#22c55e', 'Usado': '#f59e0b', 'Reciclaje': '#ef4444' };

const createMarkerIcon = (color) => {
  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// ─── Paleta corporativa ───────────────────────────────────────────────────────
const C = {
  cyan:    '#31C2DB',
  emerald: '#10b981',
  purple:  '#a78bfa',
  amber:   '#f59e0b',
};

// ─── API ─────────────────────────────────────────────────────────────────────
const authHeader = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};
const api = {
  getUsers:         ()           => axios.get(`${API}/api/usuarios`).then(r => r.data),
  deleteUser:       (id)         => axios.delete(`${API}/api/usuarios/${id}`).then(r => r.data),
  toggleUser:       (id, activo) => axios.patch(`${API}/api/usuarios/${id}`, { activo }).then(r => r.data),
  getPubs:          ()           => axios.get(`${API}/api/publicaciones?limit=200&page=1`).then(r => Array.isArray(r.data) ? r.data : r.data.rows),
  deletePub:        (id)         => axios.delete(`${API}/api/publicaciones/${id}`).then(r => r.data),
  togglePub:        (id, visible)=> axios.patch(`${API}/api/publicaciones/${id}`, { visible }).then(r => r.data),
  getDonaciones:    ()           => axios.get(`${API}/api/admin/donaciones`, { headers: authHeader() }).then(r => r.data),
  getStats:         ()           => axios.get(`${API}/api/admin/stats`,      { headers: authHeader() }).then(r => r.data),
  getDashboardStats:()           => axios.get(`${API}/api/admin/dashboard-stats`, { headers: authHeader() }).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTES UI COMPARTIDOS — tema claro, mismo ADN que la web de usuario
// ══════════════════════════════════════════════════════════════════════════════

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, trend, color = '#31C2DB', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl p-5 border border-slate-100"
    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}14`, color }}>
        {icon}
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full
          ${trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
          {trend >= 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-black text-slate-900 mb-1">{fmt(value)}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
  </motion.div>
);

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = '#31C2DB' }) => (
  <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide inline-block"
    style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
    {children}
  </span>
);

// ─── TABLE ────────────────────────────────────────────────────────────────────
const TableShell = ({ children }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-100">
    <table className="w-full text-sm">{children}</table>
  </div>
);
const Th = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100 ${className}`}>
    {children}
  </th>
);
const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-slate-600 border-b border-slate-50 ${className}`}>
    {children}
  </td>
);

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
const Confirm = ({ msg, onOk, onCancel }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)' }}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
      <AlertTriangle size={32} className="text-amber-500 mb-3" />
      <p className="text-slate-800 font-bold mb-5 text-sm">{msg}</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
          Cancelar
        </button>
        <button onClick={onOk}
          className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 transition-colors">
          Confirmar
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <motion.div initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 80, opacity: 0 }}
    className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold text-white"
    style={{ background: type === 'ok' ? '#22c55e' : '#ef4444' }}>
    {type === 'ok' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
    {msg}
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTES DE GRÁFICOS — sin dependencias externas, SVG + CSS puro
// ══════════════════════════════════════════════════════════════════════════════

// ─── Wrapper de tarjeta de gráfico ───────────────────────────────────────────
const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5"
    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
    <div className="mb-4">
      <p className="text-sm font-black text-slate-800">{title}</p>
      {subtitle && <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ─── Gráfico de barras horizontales ──────────────────────────────────────────
const HBarChart = ({ data = [], color = C.cyan }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  if (!data.length) return (
    <p className="text-center text-slate-300 text-sm py-8">Sin datos suficientes</p>
  );
  return (
    <div className="space-y-3">
      {data.map(({ label, value }, i) => (
        <div key={label}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-slate-600 truncate pr-3 max-w-[65%]">{label}</span>
            <span className="text-xs font-black" style={{ color }}>{value}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(value / max) * 100}%` }}
              transition={{ duration: 0.75, delay: i * 0.07, ease: [0.34, 1.2, 0.64, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg,${color},${color}bb)` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Gráfico de líneas SVG (estilo Grafana) ───────────────────────────────────
const SVGLineChart = ({ data = [], color = C.cyan }) => {
  const VW = 600, VH = 190;
  const PAD = { t: 20, r: 20, b: 38, l: 36 };
  const cW  = VW - PAD.l - PAD.r;
  const cH  = VH - PAD.t - PAD.b;
  const n   = data.length;

  if (!n) return (
    <p className="text-center text-slate-300 text-sm py-10">Sin publicaciones registradas</p>
  );

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const px = (i) => (PAD.l + (n === 1 ? cW / 2 : (i / (n - 1)) * cW)).toFixed(1);
  const py = (v)  => (PAD.t + cH - (v / maxVal) * cH).toFixed(1);

  const lineD = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.value)}`).join(' ');
  const areaD = `${lineD} L${px(n - 1)},${(PAD.t + cH).toFixed(1)} L${px(0)},${(PAD.t + cH).toFixed(1)}Z`;
  const yTicks = [0, 0.5, 1].map(f => ({
    y:     (PAD.t + cH - f * cH).toFixed(1),
    label: Math.round(maxVal * f),
  }));
  const gradId = `lg${color.replace('#', '')}`;

  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Grid horizontales */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={t.y} x2={PAD.l + cW} y2={t.y}
            stroke="#f1f5f9" strokeWidth="1"/>
          <text x={PAD.l - 6} y={Number(t.y) + 4}
            textAnchor="end" fontSize="12" fill="#94a3b8" fontFamily="Plus Jakarta Sans, sans-serif">
            {t.label}
          </text>
        </g>
      ))}

      {/* Área rellena */}
      <path d={areaD} fill={`url(#${gradId})`}/>

      {/* Línea */}
      <path d={lineD} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>

      {/* Puntos + etiquetas X */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(d.value)} r="4"
            fill="white" stroke={color} strokeWidth="2.5"/>
          <text x={px(i)} y={VH - 4}
            textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Plus Jakarta Sans, sans-serif">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
//  SECCIONES
// ──────────────────────────────────────────────────────────────────────────────

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = ({ stats, publicaciones, historial = [], dashboardStats }) => {

  // ── Datos derivados para los gráficos ──────────────────────────────────────
  const categoriaData = Object.entries(
    publicaciones.reduce((a, p) => {
      const k = p.categoria || 'General';
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {})
  ).map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const ubicacionData = Object.entries(
    publicaciones.reduce((a, p) => {
      if (p.ubicacion) { a[p.ubicacion] = (a[p.ubicacion] || 0) + 1; }
      return a;
    }, {})
  ).map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Últimas 8 semanas
  const tendenciaData = (() => {
    const now  = Date.now();
    const WEEK = 7 * 86_400_000;
    return Array.from({ length: 8 }, (_, i) => {
      const desde = now - (7 - i) * WEEK;
      const hasta = desde + WEEK;
      const count = publicaciones.filter(p => {
        const t = new Date(p.fecha).getTime();
        return t >= desde && t < hasta;
      }).length;
      const d = new Date(desde);
      return {
        label: d.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }),
        value: count,
      };
    });
  })();

  return (
    <div className="space-y-5">

      {/* ── 4 KPIs principales ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18}/>}        label="Usuarios"      value={stats.usuarios}      trend={12} color={C.cyan}    delay={0}   />
        <StatCard icon={<Package size={18}/>}       label="Publicaciones" value={stats.publicaciones}  trend={8}  color={C.purple} delay={0.05}/>
        <StatCard icon={<Handshake size={18}/>}     label="Donaciones"    value={historial.length}    trend={5}  color={C.emerald} delay={0.1} />
        <StatCard icon={<MessageSquare size={18}/>} label="Mensajes"      value={stats.mensajes}      trend={-3} color={C.amber}  delay={0.15}/>
      </div>

      {/* ── Gráfico 1 y 2: Barras horizontales ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ChartCard
            title="Dispositivos Más Publicados"
            subtitle="Cantidad por categoría de dispositivo"
          >
            <HBarChart data={categoriaData} color={C.cyan} />
          </ChartCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ChartCard
            title="Ubicaciones Más Activas"
            subtitle="Publicaciones por ciudad o región"
          >
            <HBarChart data={ubicacionData} color={C.emerald} />
          </ChartCard>
        </motion.div>
      </div>

      {/* ── Gráfico 3: Línea temporal ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <ChartCard
          title="Tendencia de Publicaciones"
          subtitle="Nuevas publicaciones por semana — últimas 8 semanas"
        >
          <SVGLineChart data={tendenciaData} color={C.cyan} />
        </ChartCard>
      </motion.div>

      {/* ── MÓDULO DE MAPA GEORREFERENCIADO ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-black text-slate-800 font-['Plus_Jakarta_Sans']">Georreferenciación de Impacto RAEE y Donaciones</p>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-['Plus_Jakarta_Sans']">
              Ubicación y ciclo de vida de los dispositivos publicados
            </p>
          </div>
          
          <div className="h-96 rounded-xl overflow-hidden border border-slate-100 relative z-10">
            <MapContainer center={[-17.3895, -66.1568]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {dashboardStats?.mapa?.map((point) => {
                let markerColor = '#31C2DB'; // Activos -> Color Celeste
                let label = 'Activo';
                if (point.ciclo === 'donacion') {
                  markerColor = '#10b981'; // Donado -> Color Verde
                  label = 'Donación Concluida';
                } else if (point.ciclo === 'reciclaje') {
                  markerColor = '#ef4444'; // Reciclaje -> Color Rojo
                  label = 'Reciclaje Concluido';
                }

                const customIcon = createMarkerIcon(markerColor);

                return (
                  <Marker key={point.id} position={[point.lat, point.lng]} icon={customIcon}>
                    <Popup>
                      <div className="font-['Plus_Jakarta_Sans'] text-slate-800 p-1">
                        <p className="font-black text-sm mb-1">{point.titulo}</p>
                        <div className="flex flex-wrap gap-1.5 items-center mb-1">
                          <span 
                            className="text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: markerColor }}
                          >
                            {label}
                          </span>
                          {point.verificado && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Sello IA: ✓ Verificado
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          <strong>Ubicación:</strong> {point.ubicacion || '—'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          <strong>Estado original:</strong> {point.estado || '—'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </motion.div>

      {/* ── GRÁFICAS DE IMPACTO RECHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* GRÁFICA 1: Eficiencia de Procesamiento */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-black text-slate-800 font-['Plus_Jakarta_Sans']">Eficiencia de Procesamiento de Equipos</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-['Plus_Jakarta_Sans']">
                Total publicados vs Cerrados con éxito
              </p>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardStats?.eficiencia || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    fontFamily="Plus Jakarta Sans" 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    fontFamily="Plus Jakarta Sans" 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontFamily: 'Plus Jakarta Sans', 
                      fontSize: '12px',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontFamily: 'Plus Jakarta Sans', 
                      fontSize: '11px',
                      paddingTop: '10px'
                    }}
                  />
                  <Bar dataKey="publicados" name="Total Publicados" fill="#31C2DB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="exitosos" name="Cerrados con Éxito" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* GRÁFICA 2: Histórico de Transacciones Circulares */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-black text-slate-800 font-['Plus_Jakarta_Sans']">Histórico de Transacciones Circulares Concluidas</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-['Plus_Jakarta_Sans']">
                Conteo neto de transacciones exitosas
              </p>
            </div>
            
            <div className="h-64 flex flex-col justify-center items-center relative">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={dashboardStats?.acumulado || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" /> {/* Donados -> Emerald */}
                    <Cell fill="#ef4444" /> {/* Reciclados -> Red */}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      fontFamily: 'Plus Jakarta Sans', 
                      fontSize: '12px',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend overlay */}
              <div className="flex gap-4 mt-2 text-xs font-bold text-slate-600 font-['Plus_Jakarta_Sans']">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>Donados ({dashboardStats?.acumulado?.[0]?.value || 0})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span>Reciclados ({dashboardStats?.acumulado?.[1]?.value || 0})</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

// ─── GESTIÓN USUARIOS ─────────────────────────────────────────────────────────
const GestionUsuarios = ({ usuarios, onDelete, onToggle }) => {
  const [search,    setSearch]    = useState('');
  const [rolFilter, setRolFilter] = useState('');

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    return (!q || `${u.nombre} ${u.apellidos} ${u.email}`.toLowerCase().includes(q))
        && (!rolFilter || u.rol === rolFilter);
  });

  const inputCls = 'bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-400 transition-colors';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario…"
              className={`${inputCls} pl-9 pr-4 py-2.5`} style={{ width: 220 }} />
          </div>
          <select value={rolFilter} onChange={e => setRolFilter(e.target.value)}
            className={`${inputCls} px-3 py-2.5`}>
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="usuario">Usuario</option>
          </select>
        </div>
        <span className="text-xs font-bold text-slate-400">{filtered.length} usuarios</span>
      </div>

      <TableShell>
        <thead><tr><Th>#</Th><Th>Usuario</Th><Th>Email</Th><Th>Rol</Th><Th>Estado</Th><Th>Acciones</Th></tr></thead>
        <tbody>
          {filtered.map((u, i) => (
            <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="hover:bg-slate-50 transition-colors">
              <Td><span className="text-slate-400 text-xs">{u.id}</span></Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: `hsl(${(u.id * 47) % 360},55%,48%)` }}>
                    {(u.nombre || 'U')[0].toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-slate-800">{u.nombre} {u.apellidos}</p>
                </div>
              </Td>
              <Td><span className="text-xs text-slate-500">{u.email}</span></Td>
              <Td><Badge color={u.rol === 'admin' ? '#f59e0b' : '#31C2DB'}>{u.rol || 'usuario'}</Badge></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${u.activo === false ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  <span className="text-xs text-slate-500">{u.activo === false ? 'Bloqueado' : 'Activo'}</span>
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onToggle(u.id, u.activo !== false)} title={u.activo === false ? 'Activar' : 'Bloquear'}
                    className="p-1.5 rounded-lg transition-all hover:scale-110"
                    style={{ background: u.activo === false ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)', color: u.activo === false ? '#22c55e' : '#ef4444' }}>
                    {u.activo === false ? <UserCheck size={13}/> : <UserX size={13}/>}
                  </button>
                  <button onClick={() => onDelete('user', u.id, `¿Eliminar a ${u.nombre}?`)}
                    className="p-1.5 rounded-lg transition-all hover:scale-110"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </Td>
            </motion.tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
};

// ─── GESTIÓN PUBLICACIONES ────────────────────────────────────────────────────
const GestionPublicaciones = ({ publicaciones, onDelete, onToggle }) => {
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [estFilter, setEstFilter] = useState('');

  const filtered = publicaciones.filter(p => {
    const q = search.toLowerCase();
    return (!q || `${p.titulo} ${p.descripcion || ''} ${p.marcaoModelo || ''}`.toLowerCase().includes(q))
        && (!catFilter || p.categoria === catFilter)
        && (!estFilter || p.estado === estFilter);
  });

  const inputCls = 'bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-400 transition-colors';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar publicación…"
              className={`${inputCls} pl-9 pr-4 py-2.5`} style={{ width: 220 }} />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className={`${inputCls} px-3 py-2.5`}>
            <option value="">Todas las categorías</option>
            {['Teléfonos y Accesorios','Computadoras y Accesorios','Electrodomésticos','Otros'].map(c =>
              <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={estFilter} onChange={e => setEstFilter(e.target.value)} className={`${inputCls} px-3 py-2.5`}>
            <option value="">Todos los estados</option>
            {['Buen estado','Usado','Reciclaje','Donado'].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <span className="text-xs font-bold text-slate-400">{filtered.length} publicaciones</span>
      </div>

      <TableShell>
        <thead><tr>
          <Th>ID</Th><Th>Publicación</Th><Th>Categoría</Th><Th>Estado</Th>
          <Th>Ubicación</Th><Th>Fecha</Th><Th>Visibilidad</Th><Th>Acciones</Th>
        </tr></thead>
        <tbody>
          {filtered.map((p, i) => (
            <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="hover:bg-slate-50 transition-colors">
              <Td><span className="text-slate-400 text-xs">{p.id}</span></Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  {p.foto
                    ? <img src={`${API}/uploads/${p.foto}`} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-slate-100"/>
                    : <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-50">
                        <Cpu size={14} className="text-cyan-500"/>
                      </div>
                  }
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{p.titulo}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.marcaoModelo || p.nombredeldispositivo || '—'}</p>
                  </div>
                </div>
              </Td>
              <Td><Badge>{p.categoria || 'General'}</Badge></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ESTADO_COLOR[p.estado] || '#94a3b8' }} />
                  <span className="text-xs text-slate-600">{p.estado || '—'}</span>
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={10}/>{p.ubicacion || '—'}
                </div>
              </Td>
              <Td><span className="text-xs text-slate-500">{fmtDate(p.fecha)}</span></Td>
              <Td>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                  p.visible === false ? 'text-red-500 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                  {p.visible === false ? 'Oculto' : 'Visible'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onToggle('pub', p.id, p.visible !== false)} title={p.visible === false ? 'Mostrar' : 'Ocultar'}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 bg-cyan-50 text-cyan-500 hover:bg-cyan-100">
                    {p.visible === false ? <Eye size={13}/> : <EyeOff size={13}/>}
                  </button>
                  <button onClick={() => onDelete('pub', p.id, `¿Eliminar "${p.titulo}"?`)}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 bg-red-50 text-red-500 hover:bg-red-100">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </Td>
            </motion.tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
};

// ─── IMPACTO AMBIENTAL / HISTORIAL DONACIONES ─────────────────────────────────
const HistorialDonaciones = ({ donaciones }) => {
  const [search, setSearch] = useState('');

  const totalCO2     = donaciones.reduce((s, d) => s + (d.impacto_ambiental?.co2_evitado        || 0), 0);
  const totalArboles = donaciones.reduce((s, d) => s + (d.impacto_ambiental?.arboles_equivalentes || 0), 0);

  const filtered = donaciones.filter(d => {
    const q = search.toLowerCase();
    return !q || `${d.titulo} ${d.donante_nombre || ''} ${d.receptor_nombre || ''} ${d.categoria || ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={<Leaf size={18}/>}      label="CO₂ Total Evitado"    value={totalCO2}         sub="kilogramos estimados"          color="#22c55e" delay={0}/>
        <StatCard icon={<TreePine size={18}/>}  label="Árboles Equivalentes" value={totalArboles}     sub="árboles salvados (~20 kg c/u)" color="#10b981" delay={0.05}/>
        <StatCard icon={<Handshake size={18}/>} label="Intercambios Exitosos" value={donaciones.length} sub="donaciones confirmadas"        color="#31C2DB" delay={0.1}/>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por dispositivo, donante, receptor…"
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-400 transition-colors pl-9 pr-4 py-2.5"
            style={{ width: 320 }}/>
        </div>
        <span className="text-xs font-bold text-slate-400">{filtered.length} registros</span>
      </div>

      <TableShell>
        <thead><tr>
          <Th>Dispositivo</Th><Th>Categoría</Th><Th>Donante</Th><Th>Receptor</Th>
          <Th>Fecha donación</Th><Th>CO₂ evitado</Th><Th>Árboles</Th><Th>Estado</Th>
        </tr></thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={8} className="py-16 text-center text-slate-400">
              <Leaf size={32} className="mx-auto mb-3 text-slate-200"/>
              <p className="text-sm font-bold">No hay donaciones registradas aún.</p>
            </td></tr>
          ) : filtered.map((d, i) => (
            <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
              className="hover:bg-slate-50 transition-colors">
              <Td>
                <p className="text-xs font-bold text-slate-800 truncate max-w-[160px]">{d.titulo}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{d.categoria || '—'}</p>
              </Td>
              <Td><Badge>{d.categoria || 'General'}</Badge></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: `hsl(${((d.donante_id || 1)*47)%360},55%,48%)` }}>
                    {(d.donante_nombre || 'D')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{d.donante_nombre || '—'}</p>
                    <p className="text-[10px] text-slate-400">{d.donante_email || ''}</p>
                  </div>
                </div>
              </Td>
              <Td>
                {d.receptor_nombre ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: `hsl(${((d.receptor_id || 1)*73)%360},55%,48%)` }}>
                      {d.receptor_nombre[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{d.receptor_nombre}</p>
                      <p className="text-[10px] text-slate-400">{d.receptor_email || ''}</p>
                    </div>
                  </div>
                ) : <span className="text-xs text-slate-400">Sin receptor</span>}
              </Td>
              <Td>
                <p className="text-xs text-slate-700">{fmtDate(d.fecha_donacion || d.fecha)}</p>
                <p className="text-[10px] text-slate-400">{fmtTime(d.fecha_donacion || d.fecha)}</p>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Leaf size={12}/>
                  <span className="text-xs font-black">{d.impacto_ambiental?.co2_evitado ?? '—'} kg</span>
                </div>
              </Td>
              <Td><span className="text-xs font-black text-emerald-500">~{d.impacto_ambiental?.arboles_equivalentes ?? '—'}</span></Td>
              <Td><Badge color="#22c55e">Donado</Badge></Td>
            </motion.tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
};

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const Configuracion = () => {
  const [saved, setSaved] = useState(false);
  const [form,  setForm]  = useState({ siteName: 'ReUseTech', maxPubs: 50, mantenimiento: false, registroAbierto: true });
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="max-w-xl space-y-4">
      {[
        { label: 'Nombre del sitio',                key: 'siteName', type: 'text'   },
        { label: 'Máx. publicaciones por usuario',  key: 'maxPubs',  type: 'number' },
      ].map(field => (
        <div key={field.key} className="bg-white rounded-2xl p-5 border border-slate-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{field.label}</p>
          <input type={field.type} value={form[field.key]}
            onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 outline-none focus:border-cyan-400 transition-colors"/>
        </div>
      ))}

      {[
        { label: 'Modo mantenimiento', key: 'mantenimiento',   desc: 'Muestra pantalla de mantenimiento a usuarios' },
        { label: 'Registro abierto',   key: 'registroAbierto', desc: 'Permite nuevos registros de usuarios' },
      ].map(toggle => (
        <div key={toggle.key} className="bg-white rounded-2xl p-5 flex items-center justify-between border border-slate-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div>
            <p className="text-sm font-bold text-slate-800">{toggle.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{toggle.desc}</p>
          </div>
          <button onClick={() => setForm(f => ({ ...f, [toggle.key]: !f[toggle.key] }))}
            className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
            style={{ background: form[toggle.key] ? '#31C2DB' : '#e2e8f0' }}>
            <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300"
              style={{ left: form[toggle.key] ? '1.5rem' : '0.25rem' }}/>
          </button>
        </div>
      ))}

      <button onClick={save}
        className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all"
        style={{ background: saved ? '#22c55e' : '#31C2DB', boxShadow: '0 4px 16px rgba(49,194,219,0.25)' }}>
        {saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  ADMIN PANEL — componente raíz
// ══════════════════════════════════════════════════════════════════════════════
const AdminPanel = ({ initialSection = 'dashboard' }) => {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const navigate = useNavigate();
  const location = useLocation();

  const [section,       setSection]       = useState(initialSection);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [usuarios,      setUsuarios]      = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [historial,     setHistorial]     = useState([]);
  const [mensajes,      setMensajes]      = useState(0);
  const [dashboardStats, setDashboardStats] = useState({ mapa: [], eficiencia: [], acumulado: [] });
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (location.pathname === '/admin/analitica') {
      setSection('analitica');
    } else if (location.pathname === '/admin' && section === 'analitica') {
      setSection('dashboard');
    }
  }, [location.pathname]);
  const [confirm,       setConfirm]       = useState(null);
  const [toast,         setToast]         = useState(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p, h, s, ds] = await Promise.allSettled([
        api.getUsers(),
        api.getPubs(),
        api.getDonaciones(),
        api.getStats(),
        api.getDashboardStats(),
      ]);
      if (u.status === 'fulfilled') setUsuarios(u.value);
      if (p.status === 'fulfilled') setPublicaciones(p.value);
      if (h.status === 'fulfilled') setHistorial(h.value);
      if (s.status === 'fulfilled') setMensajes(s.value.mensajes ?? 0);
      if (ds.status === 'fulfilled') setDashboardStats(ds.value);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const showToast  = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const askConfirm = (msg, onOk) => setConfirm({ msg, onOk });

  const handleDelete = (type, id, msg) => {
    askConfirm(msg, async () => {
      setConfirm(null);
      try {
        if (type === 'user') { await api.deleteUser(id); setUsuarios(prev => prev.filter(u => u.id !== id)); }
        else                 { await api.deletePub(id);  setPublicaciones(prev => prev.filter(p => p.id !== id)); }
        showToast('Eliminado correctamente');
      } catch { showToast('Error al eliminar', 'err'); }
    });
  };
  const handleToggleUser = async (id, bloquear) => {
    try {
      await api.toggleUser(id, !bloquear);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !bloquear } : u));
      showToast(bloquear ? 'Usuario bloqueado' : 'Usuario activado');
    } catch { showToast('Error al actualizar', 'err'); }
  };
  const handleTogglePub = async (type, id, ocultar) => {
    try {
      await api.togglePub(id, !ocultar);
      setPublicaciones(prev => prev.map(p => p.id === id ? { ...p, visible: !ocultar } : p));
      showToast(ocultar ? 'Publicación ocultada' : 'Publicación visible');
    } catch { showToast('Error al actualizar', 'err'); }
  };

  const stats = {
    usuarios:      usuarios.length,
    publicaciones: publicaciones.length,
    mensajes,
    activos:       usuarios.filter(u => u.activo !== false).length,
  };

  const navItems = [
    { id: 'dashboard',    icon: <LayoutDashboard size={17}/>, label: 'Dashboard' },
    { id: 'usuarios',     icon: <Users size={17}/>,           label: 'Usuarios',          badge: stats.usuarios },
    { id: 'publicaciones',icon: <Package size={17}/>,         label: 'Publicaciones',     badge: stats.publicaciones },
    { id: 'historial',    icon: <Leaf size={17}/>,            label: 'Impacto Ambiental', badge: historial.length },
    { id: 'analitica',    icon: <TrendingUp size={17}/>,      label: 'Analítica Predictiva' },
    { id: 'config',       icon: <Settings size={17}/>,        label: 'Configuración' },
  ];

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!user || user.rol !== 'admin') return (
    <div className="h-screen flex items-center justify-center bg-slate-50 font-['Plus_Jakarta_Sans']">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-red-400"/>
        </div>
        <p className="text-slate-900 font-black text-xl mb-2">Acceso restringido</p>
        <p className="text-slate-500 text-sm mb-6">Solo los administradores pueden acceder a este panel.</p>
        <Link to="/home" className="text-cyan-500 font-bold text-sm hover:underline">← Volver a la web</Link>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden flex font-['Plus_Jakarta_Sans'] bg-[#f8fafc]">

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside key="sidebar"
            initial={{ width: 0 }} animate={{ width: 252 }} exit={{ width: 0 }}
            transition={{ duration: 0.22 }}
            className="flex-shrink-0 overflow-hidden flex flex-col bg-white border-r border-slate-100">

            {/* Logo — EXACTO al Navbar del usuario */}
            <div className="px-5 py-5 flex items-center gap-2.5 border-b border-slate-100">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4 }}
                className="bg-cyan-500 p-2 rounded-xl shadow-lg shadow-cyan-200 flex-shrink-0 cursor-pointer"
              >
                <span className="text-white text-xl leading-none">♻</span>
              </motion.div>
              <div>
                <p className="text-xl font-extrabold tracking-tight text-slate-800 leading-tight">
                  ReUse<span className="text-cyan-500">Tech</span>
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-tight">
                  Admin Panel
                </p>
              </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navItems.map(item => {
                const active = section === item.id;
                return (
                  <button key={item.id} onClick={() => {
                      setSection(item.id);
                      if (item.id === 'analitica') {
                        navigate('/admin/analitica');
                      } else {
                        navigate('/admin');
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={active
                      ? { background: 'rgba(6,182,212,0.08)', color: '#0891b2', border: '1px solid rgba(6,182,212,0.18)' }
                      : { color: '#64748b', border: '1px solid transparent' }}>
                    <div className="flex items-center gap-2.5">
                      <span style={{ color: active ? '#0891b2' : '#94a3b8' }}>{item.icon}</span>
                      {item.label}
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={active
                          ? { background: 'rgba(6,182,212,0.15)', color: '#0891b2' }
                          : { background: '#f1f5f9', color: '#94a3b8' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-slate-100 space-y-3">
              <Link to="/home"
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 transition-colors">
                <Globe size={14}/> Volver a la Web
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)' }}>
                  {(user.nombre || 'A')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.nombre}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
                <button title="Cerrar sesión"
                  onClick={() => setConfirmLogoutOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={14}/>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-40"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              {sidebarOpen ? <ChevronLeft size={18}/> : <Menu size={18}/>}
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">
                {navItems.find(n => n.id === section)?.label}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={loadAll}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <RefreshCw size={16} className={loading ? 'animate-spin text-cyan-500' : ''}/>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-100">
              <Shield size={14} className="text-cyan-500"/>
              <span className="text-xs font-black text-cyan-600">Admin</span>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-cyan-500 animate-spin"/>
              <p className="text-slate-400 text-sm font-bold animate-pulse">Cargando datos…</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={section}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                {section === 'dashboard'     && <Dashboard stats={stats} publicaciones={publicaciones} historial={historial} dashboardStats={dashboardStats}/>}
                {section === 'usuarios'      && <GestionUsuarios usuarios={usuarios} onDelete={handleDelete} onToggle={handleToggleUser}/>}
                {section === 'publicaciones' && <GestionPublicaciones publicaciones={publicaciones} onDelete={handleDelete} onToggle={handleTogglePub}/>}
                {section === 'historial'     && <HistorialDonaciones donaciones={historial}/>}
                {section === 'analitica'     && <AnaliticaPredictiva/>}
                {section === 'config'        && <Configuracion/>}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Modales */}
      {confirm && <Confirm msg={confirm.msg} onOk={confirm.onOk} onCancel={() => setConfirm(null)}/>}
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type}/>}</AnimatePresence>

      {/* MODAL DE CONFIRMACIÓN DE LOGOUT */}
      <AnimatePresence>
        {confirmLogoutOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4 border border-slate-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <LogOut size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-950 mb-2">¿Cerrar Sesión de Administrador?</h3>
                <p className="text-xs text-slate-500 font-semibold mb-6">
                  ¿Estás seguro de que deseas cerrar tu sesión en el panel de control de ReUseTech?
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setConfirmLogoutOpen(false)}
                    className="flex-1 py-3 text-xs font-black text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      ['token','userId','user'].forEach(k => localStorage.removeItem(k));
                      window.location.href = '/login';
                    }}
                    className="flex-1 py-3 text-xs font-black text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
