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
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
 
  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setConfirmLogoutOpen(false);
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
    <nav className="glass sticky top-0 z-50 px-4 md:px-8">
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
 
        {/* ACCIONES DERECHA (Escritorio) */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-slate-800">{user.nombre?.split(' ')[0]}</span>
                <Link to="/perfil" className="text-[10px] text-cyan-500 font-bold hover:underline">MI CUENTA</Link>
              </div>
              <button 
                onClick={() => setConfirmLogoutOpen(true)}
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
        </div>

        {/* ACCIONES DERECHA (Móvil/Tablet) */}
        <div className="flex lg:hidden items-center gap-3">
          {!user ? (
            <Link to="/login" className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-sm hover:bg-slate-200 transition-colors">
              <User size={18} />
            </Link>
          ) : (
            <Link to="/perfil" className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-cyan-200">
              {user.nombre?.charAt(0).toUpperCase()}
            </Link>
          )}

          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

      </div>
 
      {/* MENÚ MÓVIL SIDEBAR (Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 p-6 flex flex-col justify-between lg:hidden"
            >
              <div>
                {/* Header Drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                  <span className="text-xl font-extrabold tracking-tight text-slate-800">
                    ReUse<span className="text-cyan-500">Tech</span>
                  </span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Info de Usuario */}
                {user && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
                    <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-cyan-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md shadow-cyan-200">
                      {user.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{user.nombre}</p>
                      <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">{user.rol}</p>
                    </div>
                  </div>
                )}

                {/* Enlaces de Navegación */}
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[50vh]">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        item.isAdmin
                          ? isActive(item.path)
                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                            : 'text-amber-500 hover:bg-amber-50'
                          : isActive(item.path)
                            ? 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                            : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.icon} {item.text}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Botón Cerrar Sesión / Login al pie */}
              <div className="pt-6 border-t border-slate-100">
                {user ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setConfirmLogoutOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black transition-all"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-4 text-center text-xs font-black text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-4 text-center text-xs font-black text-white bg-cyan-500 rounded-2xl hover:bg-cyan-600 shadow-md transition-all"
                    >
                      Registro
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL GLOBAL DE CONFIRMACIÓN DE LOGOUT */}
      <AnimatePresence>
        {confirmLogoutOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl max-w-sm w-full mx-4 border border-slate-100 relative overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <LogOut size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">¿Cerrar Sesión?</h3>
                <p className="text-xs text-slate-500 font-bold mb-6">
                  ¿Estás seguro de que deseas salir de tu cuenta en ReUseTech? Tendrás que iniciar sesión de nuevo para acceder a tus dispositivos.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setConfirmLogoutOpen(false)}
                    className="flex-1 py-3.5 text-xs font-black text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmLogout}
                    className="flex-1 py-3.5 text-xs font-black text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </nav>
  );
};
 
export default Navbar;