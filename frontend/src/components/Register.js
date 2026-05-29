import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, UserCheck, 
  ArrowRight, ShieldCheck, CheckCircle2,
  Sparkles
} from 'lucide-react';
import ilustracion from '../assets/ilustracion.svg';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    rol: 'usuario',
  });
  const [isFocused, setIsFocused] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', formData);
      alert('¡Bienvenido a la comunidad!');
      navigate('/login');
    } catch (error) {
      console.error('Error:', error);
      alert('Algo salió mal. Revisa tus datos.');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 md:p-10 font-['Plus_Jakarta_Sans'] overflow-hidden">
      
      {/* DECORACIÓN DE FONDO (Blobs de color) */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-white/50 relative"
        >
          {/* Badge de "Seguro" */}
          <div className="absolute -top-4 right-10 bg-green-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-200">
            <ShieldCheck size={14} /> Conexión Segura
          </div>

          <header className="mb-10">
            <h2 className="text-4xl font-[900] text-slate-900 tracking-tight">
              Crear <span className="text-cyan-500">Cuenta</span>
            </h2>
            <p className="text-slate-500 font-bold mt-2">Empieza a donar y salvar el planeta hoy.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-2">Nombre</label>
                <div className={`relative transition-all duration-300 ${isFocused === 'nombre' ? 'scale-[1.02]' : ''}`}>
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused === 'nombre' ? 'text-cyan-500' : 'text-slate-300'}`} size={20} />
                  <input
                    type="text"
                    name="nombre"
                    onFocus={() => setIsFocused('nombre')}
                    onBlur={() => setIsFocused(null)}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all"
                    placeholder="Ej. Juan"
                    required
                  />
                </div>
              </div>

              {/* Apellidos */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-2">Apellidos</label>
                <input
                  type="text"
                  name="apellidos"
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-100/50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all shadow-inner"
                  placeholder="Ej. Perez"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2">Correo Institucional / Personal</label>
              <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.01]' : ''}`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused === 'email' ? 'text-cyan-500' : 'text-slate-300'}`} size={20} />
                <input
                  type="email"
                  name="email"
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Botón Acción */}
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-slate-300 hover:bg-cyan-600 transition-all flex items-center justify-center gap-3 mt-8"
            >
              Comenzar ahora <ArrowRight size={22} />
            </motion.button>
          </form>

          <footer className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-bold text-sm">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => navigate('/login')} className="text-cyan-500 hover:underline">
                Inicia sesión
              </button>
            </p>
          </footer>
        </motion.div>

        {/* COLUMNA DERECHA: Info/Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col items-start gap-8"
        >
          <div className="bg-cyan-500/10 p-4 rounded-3xl inline-flex items-center gap-3 text-cyan-600 font-black text-sm uppercase tracking-widest">
            <Sparkles size={20} /> +10k usuarios activos
          </div>
          
          <h3 className="text-5xl font-black text-slate-900 leading-tight">
            Tu tecnología vieja es el <span className="text-cyan-500 underline decoration-cyan-200 underline-offset-8">tesoro</span> de alguien más.
          </h3>
          
          <div className="grid grid-cols-2 gap-6 w-full mt-4">
            <div className="bg-white/50 p-6 rounded-[2rem] border border-white">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 size={24} />
              </div>
              <p className="font-black text-slate-800">100% Gratis</p>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Sin comisiones</p>
            </div>
            <div className="bg-white/50 p-6 rounded-[2rem] border border-white">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <UserCheck size={24} />
              </div>
              <p className="font-black text-slate-800">Verificado</p>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Comunidad segura</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Register;