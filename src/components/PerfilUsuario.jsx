// src/components/PerfilUsuario.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  User, Mail, Settings, FileText, Save, 
  Camera, ShieldCheck, LogOut, ChevronRight, 
  Key, Edit3, X 
} from 'lucide-react';

const PerfilUsuario = () => {
  const usuarioInicial = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    nombre: usuarioInicial?.nombre || '',
    email: usuarioInicial?.email || '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/usuarios/${usuarioInicial.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Perfil actualizado con éxito');
      localStorage.setItem('user', JSON.stringify(response.data.usuarioActualizado));
      setModoEdicion(false);
    } catch (error) {
      alert('Error al actualizar perfil');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-['Plus_Jakarta_Sans'] pb-20 relative overflow-hidden">
      
      {/* DECORACIÓN DE FONDO */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#5bc0de]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] left-[-10%] w-[35%] h-[35%] bg-blue-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-12">
        
        {/* HEADER DEL PERFIL */}
        <header className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-[#5bc0de] w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(91,192,222,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5bc0de]">Mi Cuenta ReUseTech</span>
          </div>
          <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter">Panel de Usuario</h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: CARD DE IDENTIDAD */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/60 border border-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#5bc0de]/5 rounded-bl-[4rem] transition-all group-hover:scale-110" />
              
              <div className="relative flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-28 h-28 bg-gradient-to-br from-[#5bc0de] to-[#46a6c2] rounded-[2rem] flex items-center justify-center text-white shadow-lg shadow-[#5bc0de]/30">
                    <User size={56} strokeWidth={1.5} />
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-xl shadow-lg hover:bg-[#5bc0de] transition-colors">
                    <Camera size={16} />
                  </button>
                </div>

                <h3 className="text-xl font-black text-slate-900 text-center">{formData.nombre}</h3>
                <p className="text-slate-400 text-sm font-bold mb-6 italic">Usuario Verificado</p>

                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <Mail size={16} className="text-[#5bc0de]" />
                    <span className="text-xs font-bold text-slate-600 truncate">{formData.email}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { /* Lógica de logout */ }}
                  className="mt-8 flex items-center gap-2 text-red-400 hover:text-red-500 font-black text-xs uppercase tracking-widest transition-colors"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            </div>
          </motion.div>

          {/* COLUMNA DERECHA: CONFIGURACIÓN / EDICIÓN */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* CARD PRINCIPAL */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/60 border border-white">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Settings className="text-[#5bc0de]" /> 
                  {modoEdicion ? 'Editar Información' : 'Información Personal'}
                </h3>
                {!modoEdicion && (
                  <button 
                    onClick={() => setModoEdicion(true)}
                    className="p-2 bg-cyan-50 text-[#5bc0de] rounded-xl hover:bg-[#5bc0de] hover:text-white transition-all"
                  >
                    <Edit3 size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {modoEdicion ? (
                    <motion.div 
                      key="edit"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre Completo</label>
                          <input
                            type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#5bc0de] focus:ring-4 focus:ring-[#5bc0de]/5 font-bold text-slate-700 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email de Contacto</label>
                          <input
                            type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#5bc0de] focus:ring-4 focus:ring-[#5bc0de]/5 font-bold text-slate-700 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nueva Contraseña (Dejar en blanco para mantener)</label>
                        <div className="relative">
                          <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            type="password" name="password" value={formData.password} onChange={handleChange}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#5bc0de] transition-all font-bold"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button 
                          onClick={guardarCambios}
                          className="flex-1 bg-[#5bc0de] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#5bc0de]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                          <Save size={18} /> Guardar Cambios
                        </button>
                        <button 
                          onClick={() => setModoEdicion(false)}
                          className="px-6 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="view"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Nombre</p>
                        <p className="font-bold text-slate-800">{formData.nombre}</p>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Email</p>
                        <p className="font-bold text-slate-800">{formData.email}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* BOTÓN MIS PUBLICACIONES */}
            <button
              onClick={() => navigate(`/mis-publicaciones/${usuarioInicial.id}`)}
              className="w-full group bg-white p-6 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-white flex items-center justify-between hover:border-[#5bc0de]/30 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-cyan-50 text-[#5bc0de] rounded-2xl flex items-center justify-center group-hover:bg-[#5bc0de] group-hover:text-white transition-all">
                  <FileText size={28} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-slate-900 tracking-tight">Mis Publicaciones</h4>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gestiona tus equipos subidos</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#5bc0de] group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </button>
          </motion.div>
        </div>

        {/* BANNER DE SEGURIDAD REUTILIZADO */}
        <footer className="mt-12 p-8 bg-slate-900 rounded-[3rem] relative overflow-hidden group shadow-2xl shadow-slate-900/20">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#5bc0de] opacity-10 rounded-full blur-3xl group-hover:opacity-25 transition-all duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-[#5bc0de] shrink-0 border border-white/10 relative z-10">
              <ShieldCheck size={36} strokeWidth={1.5} />
            </div>
            <div className="text-center md:text-left">
              <p className="text-[#5bc0de] font-black text-xs uppercase tracking-[0.3em] mb-1">Privacidad Protegida</p>
              <h4 className="text-white font-bold text-lg mb-1 italic">"Tus datos solo se usan para conectar"</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                En ReUseTech nos tomamos en serio tu seguridad. Nunca compartiremos tu correo con terceros sin tu consentimiento.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default PerfilUsuario;