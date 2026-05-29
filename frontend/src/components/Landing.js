import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Recycle, Heart, Zap } from 'lucide-react';
import ilustracion from '../assets/ilustracion.svg';

const Landing = () => {
  return (
    <div className="overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative pt-10 md:pt-20 pb-20 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* TEXTO: Orden 1 en móvil y PC */}
          <motion.div
            className="text-center md:text-left order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-cyan-50 text-cyan-600 px-4 py-1.5 rounded-full text-[10px] md:text-sm font-bold tracking-wide uppercase mb-6 inline-block">
              ⚡ Nueva era del reciclaje
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-tight md:leading-[1.1] mb-6">
              Dona tecnología. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                Recicla futuro.
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
              La plataforma inteligente para dar una segunda vida a tus dispositivos. Conéctate con quienes lo necesitan o recicla con IA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 px-4 sm:px-0">
              <Link to="/register" className="bg-cyan-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100 flex items-center justify-center gap-2 group active:scale-95">
                Únete ahora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/home" className="bg-white text-slate-700 border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95">
                Explorar mercado
              </Link>
            </div>
          </motion.div>

          {/* ILUSTRACIÓN: Orden 2 en móvil y PC */}
          <motion.div 
            className="relative flex justify-center order-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-cyan-200 rounded-full blur-[80px] md:blur-[120px] opacity-20 animate-pulse"></div>
            <img 
              src={ilustracion} 
              alt="Tech Illustration" 
              className="relative z-10 w-[80%] md:w-full max-w-sm md:max-w-lg animate-float-slow drop-shadow-2xl" 
            />
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-slate-50/50 py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <Recycle size={32} className="text-green-500"/>, title: "1.2 Ton", desc: "E-waste reducido", color: "bg-green-50/50" },
              { icon: <Heart size={32} className="text-red-500"/>, title: "+500", desc: "Donaciones logradas", color: "bg-red-50/50" },
              { icon: <Zap size={32} className="text-amber-500"/>, title: "IA", desc: "Diagnóstico preciso", color: "bg-amber-50/50" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.98 }}
                className={`${stat.color} p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col items-center text-center`}
              >
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-5 border border-slate-100">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stat.title}</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;