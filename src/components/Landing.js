import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ilustracion from '../assets/ilustracion.svg'; // Asegúrate de tener esta imagen

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col justify-center">

      {/* Sección principal (Hero) */}
      <motion.section
        className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Texto principal */}
        <motion.div
          className="md:w-1/2 text-center md:text-left"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <h1 className="text-5xl font-black mb-6 text-[#5bc0de] leading-tight">
            Dona tecnología. Recicla futuro. 
          </h1>
          <p className="text-lg mb-8 text-gray-600">
            Únete a ReUseTech y encuentra una segunda vida para tus dispositivos tecnológicos con impacto positivo para el planeta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link to="/form" className="bg-[#5bc0de] text-white px-6 py-3 rounded-lg hover:bg-[#31a6c4] transition font-semibold shadow-md">
              Publicar dispositivo
            </Link>
            <Link to="/home" className="border-2 border-[#5bc0de] text-[#5bc0de] px-6 py-3 rounded-lg hover:bg-[#5bc0de] hover:text-white font-semibold transition shadow-md">
              Ver publicaciones
            </Link>
          </div>
        </motion.div>

        {/* Ilustración animada */}
        <motion.div
          className="md:w-1/2 mb-10 md:mb-0"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          <img
            src={ilustracion}
            alt="Ilustración tecnológica"
            className="w-full max-w-md mx-auto animate-float"
          />
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Landing;