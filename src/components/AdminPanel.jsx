import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LayoutDashboard, Users, Package, MessageSquare, Settings,
  Trash2, Eye, EyeOff, Search, ChevronDown, RefreshCw,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  XCircle, Shield, LogOut, Bell, BarChart3, Activity,
  ArrowUpRight, MoreVertical, Filter, Download, Ban,
  UserCheck, UserX, Cpu, Globe, Zap, ChevronRight,
  Menu, X, Calendar, MapPin, Tag, ChevronLeft
} from 'lucide-react';

const API = 'http://localhost:5000';

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('es-BO');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : '—';

const estadoColor = { 'Buen estado': '#22c55e', 'Usado': '#f59e0b', 'Reciclaje': '#ef4444' };

// ─── API HELPERS ─────────────────────────────────────────────────────────────
const api = {
  getUsers:        () => axios.get(`${API}/api/usuarios`).then(r => r.data),
  deleteUser:      (id) => axios.delete(`${API}/api/usuarios/${id}`).then(r => r.data),
  toggleUser:      (id, activo) => axios.patch(`${API}/api/usuarios/${id}`, { activo }).then(r => r.data),
  getPubs:         () => axios.get(`${API}/api/publicaciones?limit=200&page=1`).then(r => Array.isArray(r.data) ? r.data : r.data.rows),
  deletePub:       (id) => axios.delete(`${API}/api/publicaciones/${id}`).then(r => r.data),
  togglePub:       (id, visible) => axios.patch(`${API}/api/publicaciones/${id}`, { visible }).then(r => r.data),
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, trend, color = '#31C2DB', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative overflow-hidden rounded-2xl p-5"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
  >
    <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-[60px] opacity-10 pointer-events-none"
      style={{ background: color }} />
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full
          ${trend >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
          {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-3xl font-black text-white mb-1">{fmt(value)}</p>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    {sub && <p className="text-[10px] text-slate-600 mt-1">{sub}</p>}
  </motion.div>
);

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = '#31C2DB' }) => (
  <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide"
    style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
    {children}
  </span>
);

// ─── TABLE SHELL ─────────────────────────────────────────────────────────────
const TableShell = ({ children }) => (
  <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
    <table className="w-full text-sm">{children}</table>
  </div>
);

const Th = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 ${className}`}
    style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-slate-300 ${className}`}
    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    {children}
  </td>
);

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
const Confirm = ({ msg, onOk, onCancel }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
      <AlertTriangle size={32} className="text-amber-400 mb-3" />
      <p className="text-white font-bold mb-5">{msg}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          Cancelar
        </button>
        <button onClick={onOk} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-colors"
          style={{ background: '#ef4444' }}>
          Confirmar
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <motion.div initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 80, opacity: 0 }}
    className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold text-white"
    style={{ background: type === 'ok' ? '#22c55e' : '#ef4444' }}>
    {type === 'ok' ? <CheckCircle size={16} /> : <XCircle size={16} />}
    {msg}
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIONES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = ({ stats, publicaciones, usuarios }) => {
  const cats = publicaciones.reduce((acc, p) => {
    acc[p.categoria || 'General'] = (acc[p.categoria || 'General'] || 0) + 1;
    return acc;
  }, {});

  const estados = publicaciones.reduce((acc, p) => {
    acc[p.estado || 'Sin estado'] = (acc[p.estado || 'Sin estado'] || 0) + 1;
    return acc;
  }, {});

  const recientes = [...publicaciones].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18}/>}   label="Usuarios"      value={stats.usuarios}     trend={12}  color="#31C2DB" delay={0}   />
        <StatCard icon={<Package size={18}/>}  label="Publicaciones" value={stats.publicaciones} trend={8}   color="#a78bfa" delay={0.05}/>
        <StatCard icon={<MessageSquare size={18}/>} label="Mensajes" value={stats.mensajes}     trend={-3}  color="#fb923c" delay={0.1} />
        <StatCard icon={<Activity size={18}/>} label="Activos hoy"   value={stats.activos}      trend={5}   color="#34d399" delay={0.15}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Categorías */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Por Categoría</p>
          <div className="space-y-3">
            {Object.entries(cats).map(([cat, count]) => {
              const pct = Math.round((count / publicaciones.length) * 100) || 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300 truncate">{cat}</span>
                    <span style={{ color: '#31C2DB' }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #31C2DB, #0e7fa8)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Estados */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Por Estado</p>
          <div className="space-y-3">
            {Object.entries(estados).map(([est, count]) => {
              const pct = Math.round((count / publicaciones.length) * 100) || 0;
              const color = estadoColor[est] || '#64748b';
              return (
                <div key={est}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-slate-300">{est}</span>
                    </div>
                    <span style={{ color }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Usuarios recientes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Últimos Usuarios</p>
          <div className="space-y-3">
            {usuarios.slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: `hsl(${(u.id * 47) % 360}, 60%, 45%)` }}>
                  {(u.nombre || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{u.nombre} {u.apellidos}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>
                <Badge color={u.rol === 'admin' ? '#f59e0b' : '#31C2DB'}>{u.rol || 'user'}</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Últimas publicaciones */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Publicaciones Recientes</p>
        <TableShell>
          <thead>
            <tr>
              <Th>Título</Th>
              <Th>Categoría</Th>
              <Th>Estado</Th>
              <Th>Ubicación</Th>
              <Th>Fecha</Th>
            </tr>
          </thead>
          <tbody>
            {recientes.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <Td><span className="font-semibold text-white truncate block max-w-[180px]">{p.titulo}</span></Td>
                <Td><Badge>{p.categoria || 'General'}</Badge></Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: estadoColor[p.estado] || '#64748b' }} />
                    <span className="text-xs">{p.estado || '—'}</span>
                  </div>
                </Td>
                <Td><span className="text-xs">{p.ubicacion || '—'}</span></Td>
                <Td><span className="text-xs">{fmtDate(p.fecha)}</span></Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </motion.div>
    </div>
  );
};

// ─── GESTIÓN USUARIOS ────────────────────────────────────────────────────────
const GestionUsuarios = ({ usuarios, onDelete, onToggle }) => {
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('');

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || `${u.nombre} ${u.apellidos} ${u.email}`.toLowerCase().includes(q);
    const matchR = !rolFilter || u.rol === rolFilter;
    return matchQ && matchR;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar usuario..."
              className="pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', width: 220 }} />
          </div>
          <select value={rolFilter} onChange={e => setRolFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="usuario">Usuario</option>
          </select>
        </div>
        <span className="text-xs font-bold text-slate-500">{filtered.length} usuarios</span>
      </div>

      <TableShell>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>Usuario</Th>
            <Th>Email</Th>
            <Th>Rol</Th>
            <Th>Estado</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u, i) => (
            <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="hover:bg-white/[0.02] transition-colors">
              <Td><span className="text-slate-600 text-xs">{u.id}</span></Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: `hsl(${(u.id * 47) % 360}, 55%, 42%)` }}>
                    {(u.nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{u.nombre} {u.apellidos}</p>
                  </div>
                </div>
              </Td>
              <Td><span className="text-xs text-slate-400">{u.email}</span></Td>
              <Td><Badge color={u.rol === 'admin' ? '#f59e0b' : '#31C2DB'}>{u.rol || 'usuario'}</Badge></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${u.activo === false ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="text-xs text-slate-400">{u.activo === false ? 'Bloqueado' : 'Activo'}</span>
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onToggle(u.id, u.activo !== false)}
                    title={u.activo === false ? 'Activar' : 'Bloquear'}
                    className="p-1.5 rounded-lg transition-colors hover:scale-110"
                    style={{ background: u.activo === false ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)', color: u.activo === false ? '#22c55e' : '#ef4444' }}>
                    {u.activo === false ? <UserCheck size={13}/> : <UserX size={13}/>}
                  </button>
                  <button onClick={() => onDelete('user', u.id, `¿Eliminar a ${u.nombre}?`)}
                    className="p-1.5 rounded-lg transition-colors hover:scale-110"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
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
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [estFilter, setEstFilter] = useState('');

  const filtered = publicaciones.filter(p => {
    const q = search.toLowerCase();
    const mQ = !q || `${p.titulo} ${p.descripcion || ''} ${p.marcaoModelo || ''}`.toLowerCase().includes(q);
    const mC = !catFilter || p.categoria === catFilter;
    const mE = !estFilter || p.estado === estFilter;
    return mQ && mC && mE;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar publicación..."
              className="pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', width: 220 }} />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="">Todas las categorías</option>
            {['Teléfonos y Accesorios','Computadoras y Accesorios','Electrodomésticos','Otros'].map(c =>
              <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={estFilter} onChange={e => setEstFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="">Todos los estados</option>
            {['Buen estado','Usado','Reciclaje'].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <span className="text-xs font-bold text-slate-500">{filtered.length} publicaciones</span>
      </div>

      <TableShell>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Publicación</Th>
            <Th>Categoría</Th>
            <Th>Estado</Th>
            <Th>Ubicación</Th>
            <Th>Fecha</Th>
            <Th>Visibilidad</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="hover:bg-white/[0.02] transition-colors">
              <Td><span className="text-slate-600 text-xs">{p.id}</span></Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  {p.foto
                    ? <img src={`${API}/uploads/${p.foto}`} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(49,194,219,0.1)' }}>
                        <Cpu size={14} style={{ color: '#31C2DB' }} />
                      </div>
                  }
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[160px]">{p.titulo}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{p.marcaoModelo || p.nombredeldispositivo || '—'}</p>
                  </div>
                </div>
              </Td>
              <Td><Badge>{p.categoria || 'General'}</Badge></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: estadoColor[p.estado] || '#64748b' }} />
                  <span className="text-xs text-slate-400">{p.estado || '—'}</span>
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={10}/>{p.ubicacion || '—'}
                </div>
              </Td>
              <Td><span className="text-xs text-slate-500">{fmtDate(p.fecha)}</span></Td>
              <Td>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${p.visible === false
                  ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
                  {p.visible === false ? 'Oculto' : 'Visible'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onToggle('pub', p.id, p.visible !== false)}
                    title={p.visible === false ? 'Mostrar' : 'Ocultar'}
                    className="p-1.5 rounded-lg transition-colors hover:scale-110"
                    style={{ background: 'rgba(49,194,219,0.1)', color: '#31C2DB' }}>
                    {p.visible === false ? <Eye size={13}/> : <EyeOff size={13}/>}
                  </button>
                  <button onClick={() => onDelete('pub', p.id, `¿Eliminar "${p.titulo}"?`)}
                    className="p-1.5 rounded-lg transition-colors hover:scale-110"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
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

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const Configuracion = () => {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ siteName: 'ReUseTech', maxPubs: 50, mantenimiento: false, registroAbierto: true });

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="max-w-xl space-y-5">
      {[
        { label: 'Nombre del sitio', key: 'siteName', type: 'text' },
        { label: 'Máx. publicaciones por usuario', key: 'maxPubs', type: 'number' },
      ].map(field => (
        <div key={field.key} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{field.label}</p>
          <input type={field.type} value={form[field.key]}
            onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      ))}

      {[
        { label: 'Modo mantenimiento', key: 'mantenimiento', desc: 'Muestra pantalla de mantenimiento a usuarios' },
        { label: 'Registro abierto', key: 'registroAbierto', desc: 'Permite nuevos registros' },
      ].map(toggle => (
        <div key={toggle.key} className="rounded-2xl p-5 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-sm font-bold text-white">{toggle.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{toggle.desc}</p>
          </div>
          <button onClick={() => setForm(f => ({ ...f, [toggle.key]: !f[toggle.key] }))}
            className="relative w-12 h-6 rounded-full transition-all duration-300"
            style={{ background: form[toggle.key] ? '#31C2DB' : 'rgba(255,255,255,0.1)' }}>
            <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
              style={{ left: form[toggle.key] ? '1.5rem' : '0.25rem' }} />
          </button>
        </div>
      ))}

      <button onClick={save}
        className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all"
        style={{ background: saved ? '#22c55e' : '#31C2DB', boxShadow: '0 4px 20px rgba(49,194,219,0.3)' }}>
        {saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN PANEL PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const AdminPanel = () => {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [section,      setSection]      = useState('dashboard');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [usuarios,     setUsuarios]     = useState([]);
  const [publicaciones,setPublicaciones]= useState([]);
  const [loading,      setLoading]      = useState(true);
  const [confirm,      setConfirm]      = useState(null);   // { msg, onOk }
  const [toast,        setToast]        = useState(null);   // { msg, type }

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.allSettled([api.getUsers(), api.getPubs()]);
      if (u.status === 'fulfilled') setUsuarios(u.value);
      if (p.status === 'fulfilled') setPublicaciones(p.value);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Confirm helper ─────────────────────────────────────────────────────────
  const askConfirm = (msg, onOk) => setConfirm({ msg, onOk });

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleDelete = (type, id, msg) => {
    askConfirm(msg, async () => {
      setConfirm(null);
      try {
        if (type === 'user') {
          await api.deleteUser(id);
          setUsuarios(prev => prev.filter(u => u.id !== id));
        } else {
          await api.deletePub(id);
          setPublicaciones(prev => prev.filter(p => p.id !== id));
        }
        showToast('Eliminado correctamente', 'ok');
      } catch {
        showToast('Error al eliminar', 'err');
      }
    });
  };

  const handleToggleUser = async (id, bloquear) => {
    try {
      await api.toggleUser(id, !bloquear);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !bloquear } : u));
      showToast(bloquear ? 'Usuario bloqueado' : 'Usuario activado', 'ok');
    } catch { showToast('Error al actualizar', 'err'); }
  };

  const handleTogglePub = async (type, id, ocultar) => {
    try {
      await api.togglePub(id, !ocultar);
      setPublicaciones(prev => prev.map(p => p.id === id ? { ...p, visible: !ocultar } : p));
      showToast(ocultar ? 'Publicación ocultada' : 'Publicación visible', 'ok');
    } catch { showToast('Error al actualizar', 'err'); }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    usuarios:     usuarios.length,
    publicaciones: publicaciones.length,
    mensajes:     0,
    activos:      usuarios.filter(u => u.activo !== false).length,
  };

  // ── Nav items ──────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard',    icon: <LayoutDashboard size={17}/>, label: 'Dashboard' },
    { id: 'usuarios',     icon: <Users size={17}/>,           label: 'Usuarios',       badge: stats.usuarios },
    { id: 'publicaciones',icon: <Package size={17}/>,         label: 'Publicaciones',  badge: stats.publicaciones },
    { id: 'config',       icon: <Settings size={17}/>,        label: 'Configuración' },
  ];

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!user || user.rol !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#0f172a' }}>
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-white font-black text-xl mb-2">Acceso restringido</p>
          <p className="text-slate-500 text-sm">Solo los administradores pueden ver esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-['Plus_Jakarta_Sans']" style={{ background: '#0f172a' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0 }}
            animate={{ width: 240 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.22 }}
            className="flex-shrink-0 overflow-hidden flex flex-col"
            style={{ background: '#111827', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Logo */}
            <div className="px-5 py-6 flex items-center gap-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #31C2DB, #0e7fa8)' }}>
                <span className="text-white text-lg">♻</span>
              </div>
              <div>
                <p className="text-sm font-black text-white">ReUseTech</p>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#31C2DB' }}>Admin Panel</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setSection(item.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={section === item.id
                    ? { background: 'rgba(49,194,219,0.12)', color: '#31C2DB', border: '1px solid rgba(49,194,219,0.2)' }
                    : { color: '#64748b', border: '1px solid transparent' }}>
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: section === item.id ? 'rgba(49,194,219,0.2)' : 'rgba(255,255,255,0.06)', color: section === item.id ? '#31C2DB' : '#475569' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* User footer */}
            <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #31C2DB, #0e7fa8)' }}>
                  {(user.nombre || 'A').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.nombre}</p>
                  <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
                </div>
                <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
                  <LogOut size={14}/>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-40"
          style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)}
              className="p-2 rounded-xl transition-colors text-slate-500 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              {sidebarOpen ? <ChevronLeft size={18}/> : <Menu size={18}/>}
            </button>
            <div>
              <h1 className="text-lg font-black text-white capitalize">
                {navItems.find(n => n.id === section)?.label}
              </h1>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={loadAll}
              className="p-2 rounded-xl transition-colors text-slate-500 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(49,194,219,0.1)', border: '1px solid rgba(49,194,219,0.2)' }}>
              <Shield size={14} style={{ color: '#31C2DB' }} />
              <span className="text-xs font-black" style={{ color: '#31C2DB' }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-12 h-12 rounded-full border-4 animate-spin"
                style={{ borderColor: 'rgba(49,194,219,0.15)', borderTopColor: '#31C2DB' }} />
              <p className="text-slate-500 text-sm font-bold animate-pulse">Cargando datos...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={section}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>
                {section === 'dashboard'     && <Dashboard stats={stats} publicaciones={publicaciones} usuarios={usuarios} />}
                {section === 'usuarios'      && <GestionUsuarios usuarios={usuarios} onDelete={handleDelete} onToggle={handleToggleUser} />}
                {section === 'publicaciones' && <GestionPublicaciones publicaciones={publicaciones} onDelete={handleDelete} onToggle={handleTogglePub} />}
                {section === 'config'        && <Configuracion />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────── */}
      {confirm && <Confirm msg={confirm.msg} onOk={confirm.onOk} onCancel={() => setConfirm(null)} />}
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>
    </div>
  );
};

export default AdminPanel;