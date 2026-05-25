import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Search, 
  User, 
  Inbox, 
  Bot, 
  Wrench, 
  Scan, 
  LogOut, 
  Menu, 
  X,
  ClipboardCheck,
  Activity,
  ScanEye,
  Shield
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
 
  const isActive = (path) => location.pathname === path;
 
  const navItems = user ? [
    { path: '/home',                icon: <Home size={18}/>,    text: 'Inicio' },
    { path: '/form',                icon: <Upload size={18}/>,  text: 'Publicar' },
    { path: '/bandeja',             icon: <Inbox size={18}/>,   text: 'Mensajes' },
    { path: '/soporte',             icon: <Bot size={18}/>,     text: 'IA Soporte' },
    { path: '/diagnostico',         icon: <Wrench size={18}/>,  text: 'Taller' },
    { path: '/diagnostico-sistemas',icon: <Activity size={18}/>,text: 'Test Salud' }, 
    { path: '/escaner',             icon: <ScanEye size={18}/>, text: 'Escáner 3D' },
    // Solo aparece si el usuario es admin
    ...(user.rol === 'admin' ? [{ path: '/admin', icon: <Shield size={18}/>, text: 'Admin', isAdmin: true }] : []),
  ] : [];
 
  return (
    <nav className="glass sticky top-0 z-50 px-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 md:h-20">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="bg-cyan-500 p-2 rounded-xl shadow-lg shadow-cyan-200"
          >
            <span className="text-white text-xl">♻</span>
          </motion.div>
          <span className="text-xl font-extrabold tracking-tight text-slate-800 hidden sm:block">
            ReUse<span className="text-cyan-500">Tech</span>
          </span>
        </Link>
 
        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                item.isAdmin
                  ? isActive(item.path)
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                    : 'text-amber-500 hover:bg-amber-50'
                  : isActive(item.path)
                    ? 'bg-white text-cyan-600 shadow-sm'
                    : 'text-slate-500 hover:text-cyan-600'
              }`}
            >
              {item.icon} {item.text}
            </Link>
          ))}
        </div>
 
        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-slate-800">{user.nombre?.split(' ')[0]}</span>
                <Link to="/perfil" className="text-[10px] text-cyan-500 font-bold hover:underline">MI CUENTA</Link>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600">Entrar</Link>
              <Link to="/register" className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">Registro</Link>
            </div>
          )}
 
          {/* BOTÓN MÓVIL */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
 
      {/* MENÚ MÓVIL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-4 lg:hidden overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex flex-col items-center justify-center aspect-square rounded-2xl transition-all ${
                    item.isAdmin
                      ? isActive(item.path)
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-amber-50 text-amber-500'
                      : isActive(item.path)
                        ? 'bg-cyan-500 text-white shadow-lg'
                        : 'bg-slate-50 text-slate-600 active:bg-slate-100'
                  }`}
                >
                  <div className="mb-1">{item.icon}</div>
                  <span className="text-[9px] font-bold text-center">{item.text}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
 
export default Navbar;