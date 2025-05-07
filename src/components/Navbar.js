import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUpload, FaSearch, FaHome, FaUser, FaInbox, FaHeadset, FaSignOutAlt, FaBars, FaTimes, FaTools } from 'react-icons/fa';
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

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items
  const navItems = user ? [
    { path: '/home', icon: <FaHome />, text: 'Home' },
    { path: '/form', icon: <FaUpload />, text: 'Publicar' },
    { path: '/buscar', icon: <FaSearch />, text: 'Buscar' },
    { path: '/perfil', icon: <FaUser />, text: 'Perfil' },
    { path: '/bandeja', icon: <FaInbox />, text: 'Mensajes' },
    { path: '/soporte', icon: <FaHeadset />, text: 'Soporte IA' },
    { path: '/diagnostico', icon: <FaTools />, text: 'Diagnóstico' }, 
  ] : [];

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              ♻ ReUseTech
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <div className="flex space-x-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'text-gray-600 hover:text-cyan-600'
                      }`}
                    >
                      <span className="mr-1.5">{item.icon}</span>
                      {item.text}
                    </Link>
                  ))}
                </div>
                
                <div className="border-l border-gray-200 h-8 mx-4"></div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative group">
                    <div className="flex items-center cursor-pointer">
                      <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-medium">
                        {user.nombre?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-cyan-600 transition">
                        {user.nombre?.split(' ')[0] || 'Usuario'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    <FaSignOutAlt className="mr-1" />
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-cyan-600 hover:text-cyan-700 px-4 py-2 text-sm font-medium rounded-md"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md shadow-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-cyan-600 focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-3 border-b border-gray-100">
                    <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-medium text-lg">
                      {user.nombre?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{user.nombre || 'Usuario'}</p>
                      <p className="text-xs text-gray-500">{user.email || ''}</p>
                    </div>
                  </div>
                  
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.text}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-3 text-base font-medium text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-3">
                  <Link
                    to="/login"
                    className="flex justify-center items-center px-3 py-2 text-base font-medium text-cyan-600 hover:bg-cyan-50 rounded-md border border-cyan-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="flex justify-center items-center px-3 py-2 text-base font-medium bg-cyan-500 text-white hover:bg-cyan-600 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;