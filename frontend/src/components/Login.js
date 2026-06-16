import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import ilustracion from '../assets/ilustracion.svg';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isFocused, setIsFocused] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', form);
      const { token, user } = response.data;

      localStorage.setItem('token',  token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user',   JSON.stringify(user));

      navigate('/home');
    } catch (error) {
      alert('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 md:p-10 font-['Plus_Jakarta_Sans'] relative overflow-hidden">
      
      {/* BACKGROUND BLOBS (Consistencia con Register) */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">
        
        {/* ILUSTRACIÓN (Izquierda en PC para variar el ritmo) */}
        <motion.div
          className="hidden lg:flex flex-col items-center justify-center text-center"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-200 rounded-full blur-[80px] opacity-20"></div>
            <img
              src={ilustracion}
              alt="Login Visual"
              className="max-w-sm relative z-10 animate-float-slow"
            />
          </div>
          <div className="mt-8 space-y-2">
            <h3 className="text-2xl font-black text-slate-800">¡Qué bueno verte de nuevo!</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">
              Tu próxima contribución al planeta está a un clic de distancia.
            </p>
          </div>
        </motion.div>

        {/* FORMULARIO (Derecha) */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-white/50 relative"
        >
          <header className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles size={14} /> Acceso Seguro
            </div>
            <h2 className="text-4xl font-[900] text-slate-900 tracking-tight">
              Iniciar <span className="text-cyan-500">Sesión</span>
            </h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2">Email</label>
              <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.02]' : ''}`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused === 'email' ? 'text-cyan-500' : 'text-slate-300'}`} size={20} />
                <input
                  type="email"
                  name="email"
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-xs font-black text-slate-400 uppercase">Contraseña</label>
                <button type="button" className="text-[10px] font-bold text-cyan-500 hover:underline">¿Olvidaste tu contraseña?</button>
              </div>
              <div className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.02]' : ''}`}>
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused === 'password' ? 'text-cyan-500' : 'text-slate-300'}`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-100/50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-slate-300 hover:bg-cyan-600 transition-all flex items-center justify-center gap-3 mt-4"
            >
              Entrar al sistema <LogIn size={22} />
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-slate-500 font-bold text-sm">
              ¿Aún no tienes cuenta?{' '}
              <button 
                onClick={() => navigate('/register')} 
                className="text-cyan-500 hover:underline inline-flex items-center gap-1"
              >
                Regístrate gratis <ArrowRight size={14} />
              </button>
            </p>
          </div>
          
          <div className="mt-6 flex justify-center gap-4 text-slate-300">
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest self-center">Protección de datos ReUseTech</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;