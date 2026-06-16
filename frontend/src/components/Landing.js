import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Recycle, Heart, Cpu, Users, 
  MessageSquare, Shield, Activity, Sparkles, 
  Leaf, Globe, Wrench, ArrowUpRight, 
  Scan, Upload 
} from 'lucide-react';
import ilustracion from '../assets/ilustracion.svg';

const Landing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ia-health');
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const handlePublishClick = () => {
    if (user) {
      navigate('/publicar');
    } else {
      navigate('/login');
    }
  };

  // Datos de las herramientas reales para la sección 3 (Showcase de Innovación)
  const toolsData = {
    'ia-health': {
      title: "Evaluación de Salud con IA",
      path: "/diagnostico-sistemas",
      icon: <Activity size={24} className="text-[#00b0ca]" />,
      badge: "Auditoría en 5 Pasos",
      description: "Nuestra herramienta insignia para diagnosticar equipos a través de un test digital estructurado en 5 etapas críticas:",
      steps: [
        { name: "1. Tipo de Dispositivo", desc: "Clasificación de la máquina" },
        { name: "2. Estado de Encendido", desc: "Verificación de alimentación eléctrica" },
        { name: "3. Inspección Física", desc: "Evaluación de daños estructurales" },
        { name: "4. Rendimiento de Batería", desc: "Análisis de ciclos y retención de carga" },
        { name: "5. Antigüedad del Equipo", desc: "Estimación de depreciación" }
      ],
      resultInfo: "Genera automáticamente un puntaje de reutilización %, kg de CO₂ evitados, árboles salvados y gramos de minerales recuperados (Cobre, Oro, Litio).",
      btnText: "Iniciar Test de Salud",
    },
    'visual-diag': {
      title: "Diagnóstico Visual Avanzado",
      path: "/diagnostico",
      icon: <Wrench size={24} className="text-[#00b0ca]" />,
      badge: "TensorFlow.js en Navegador",
      description: "Taller técnico virtual que analiza componentes en tiempo real usando redes neuronales directamente en el cliente:",
      features: [
        { title: "Análisis por Cámara", desc: "Detección instantánea del tipo de dispositivo utilizando la cámara web." },
        { title: "Modelo TensorFlow.js", desc: "Carga dinámica de modelos clasificadores entrenados en formato .h5." },
        { title: "Estimación de Estado Físico", desc: "Calcula el porcentaje de vida útil remanente basado en descriptores visuales." }
      ],
      resultInfo: "Recomienda de forma automática si un equipo debe ser Donado (Buen Estado), Reparado (Usado) o Reciclado (Mal Estado).",
      btnText: "Probar Taller Visual",
    },
    '3d-scanner': {
      title: "Escáner 3D e Inspección Física",
      path: "/escaner",
      icon: <Scan size={24} className="text-[#00b0ca]" />,
      badge: "Modelado Three.js interactivo",
      description: "Visualizador tridimensional avanzado que renderiza componentes de hardware detectados:",
      features: [
        { title: "Reconocimiento de Piezas", desc: "Identifica componentes clave como pantallas, bisagras, teclados y puertos." },
        { title: "Visualización en 3D", desc: "Pinta los modelos tridimensionales interactivos en WebGL utilizando Three.js." },
        { title: "Confianza de Detección", desc: "Representa con códigos de colores (verde, celeste, amarillo, rojo) el nivel de confianza." }
      ],
      resultInfo: "Permite una auditoría visual transparente y preestablece los parámetros técnicos para la publicación en el catálogo.",
      btnText: "Abrir Escáner 3D",
    },
    'smart-chat': {
      title: "Mensajería Inteligente",
      path: "/bandeja",
      icon: <MessageSquare size={24} className="text-[#00b0ca]" />,
      badge: "Lógica Contextual de Contacto",
      description: "Canalización automática del propósito del chat privado según las restricciones de la base de datos de usuarios:",
      rules: [
        { role: "Particular y Fundación", action: "Solicitar Donación", desc: "Autocompila la conversación para la entrega gratuita de dispositivos funcionales." },
        { role: "Gestor Tecnológico RAEE", action: "Coordinación de Retiro de RAEE", desc: "Configura el canal para recolectar chatarra electrónica destinada a la minería urbana." }
      ],
      resultInfo: "Evita intermediarios e incrementa la velocidad de entrega en Cochabamba clasificando los flujos de comunicación desde su origen.",
      btnText: "Ver mis Mensajes",
    }
  };

  return (
    <div className="overflow-x-hidden bg-white text-slate-800 font-sans">
      
      {/* 1. HERO SECTION (Sección Principal) */}
      <section className="relative pt-12 md:pt-20 pb-20 md:pb-32 px-6 bg-gradient-to-tr from-slate-50 via-white to-cyan-50/20 overflow-hidden">
        {/* Blobs decorativos de fondo */}
        <div className="absolute top-[-20%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full blur-[100px] md:blur-[140px] opacity-15 pointer-events-none bg-[#00b0ca]" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[100px] opacity-10 pointer-events-none bg-[#00b0ca]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* TEXTO */}
          <motion.div
            className="text-center lg:text-left order-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider mb-6 border border-[#00b0ca]/30 bg-[#00b0ca]/5 text-[#00b0ca]">
              <Sparkles size={14} /> Fusión de Economía Circular e IA
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight md:leading-[1.15] mb-6 tracking-tight">
              Tecnología con <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b0ca] to-blue-600">Segunda Vida.</span> <br />
              Impacto Ambiental <span className="underline decoration-[#00b0ca] decoration-wavy decoration-3 underline-offset-8">Sostenible.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Mitigamos la huella de carbono y gestionamos residuos electrónicos (RAEE) en Cochabamba. Clasificamos hardware en tiempo real con Inteligencia Artificial para escuelas, ciudadanos y empresas de reciclaje técnico.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 sm:px-0">
              <Link 
                to="/catalogo" 
                className="bg-[#00b0ca] hover:bg-[#009cb3] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-[#00b0ca]/20 flex items-center justify-center gap-2 group active:scale-95"
              >
                Explorar Dispositivos <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={handlePublishClick} 
                className="bg-white text-slate-800 border-2 border-slate-200 hover:border-[#00b0ca]/50 hover:bg-slate-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                <Upload size={20} className="text-[#00b0ca]" /> Publicar Equipo
              </button>
            </div>
          </motion.div>

          {/* ILUSTRACIÓN */}
          <motion.div 
            className="relative flex justify-center order-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-[#00b0ca]/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse pointer-events-none"></div>
            
            <div className="relative w-full max-w-md md:max-w-lg">
              <img 
                src={ilustracion} 
                alt="ReUseTech Circular Economy Illustration" 
                className="relative z-10 w-full animate-float-slow drop-shadow-2xl" 
              />
              
              {/* Mini Widget Flotante de Huella de Carbono */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 z-20 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Leaf size={16} className="text-green-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Impacto IA</span>
                </div>
                <p className="text-xs font-bold text-slate-800">Laptop HP Reutilizada</p>
                <div className="mt-2 text-sm font-extrabold text-[#00b0ca]">
                  -320 kg CO₂
                </div>
                <div className="text-[10px] text-green-600 font-semibold mt-0.5">
                  ≈ 15 árboles salvados
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ARQUITECTURA DE TRES ROLES (Conexión con Base de Datos) */}
      <section className="py-20 md:py-28 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#00b0ca] font-extrabold uppercase tracking-widest text-xs">Integridad de Datos</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-3 tracking-tight">
              Ecosistema de Cooperación: Arquitectura de 3 Roles
            </h2>
            <p className="text-slate-500 mt-4 text-base md:text-lg">
              Validamos e integramos cada perfil de usuario según nuestra regla de restricción <code className="bg-slate-100 text-[#00b0ca] px-2 py-0.5 rounded font-mono text-sm font-bold">usuarios_rol_check</code> en la base de datos PostgreSQL, canalizando propósitos diferenciados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rol 1: Particular */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#00b0ca]/30 transition-all group"
            >
              <div>
                <div className="bg-white p-4 rounded-2xl shadow-sm w-fit border border-slate-100 mb-6 group-hover:bg-[#00b0ca] group-hover:text-white transition-colors text-slate-700">
                  <Users size={28} />
                </div>
                <div className="inline-block bg-[#00b0ca]/10 text-[#00b0ca] text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase mb-4">
                  CHECK constraint: 'Particular'
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Particular</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  Ciudadanos comprometidos de Cochabamba que buscan donar dispositivos que ya no utilizan o solicitar un equipo funcional para uso personal. Promueve la extensión directa de la vida útil del hardware.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link to="/register" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#00b0ca] uppercase hover:underline">
                  Unirme como Particular <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>

            {/* Rol 2: Fundación */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#00b0ca]/30 transition-all group"
            >
              <div>
                <div className="bg-white p-4 rounded-2xl shadow-sm w-fit border border-slate-100 mb-6 group-hover:bg-[#00b0ca] group-hover:text-white transition-colors text-slate-700">
                  <Heart size={28} />
                </div>
                <div className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase mb-4">
                  CHECK constraint: 'Fundacion'
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Fundación / Org. Social</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  Centros educativos, escuelas rurales y ONGs que requieren laboratorios tecnológicos. Cuentan con un canal preferencial para recibir lotes de dispositivos reacondicionados y reducir la brecha digital.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link to="/register" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#00b0ca] uppercase hover:underline">
                  Registrar Organización <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>

            {/* Rol 3: Gestor RAEE */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#00b0ca]/30 transition-all group"
            >
              <div>
                <div className="bg-white p-4 rounded-2xl shadow-sm w-fit border border-slate-100 mb-6 group-hover:bg-[#00b0ca] group-hover:text-white transition-colors text-slate-700">
                  <Recycle size={28} />
                </div>
                <div className="inline-block bg-green-50 text-green-600 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase mb-4">
                  CHECK constraint: 'Gestor_RAEE'
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Gestor Tecnológico RAEE</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  Empresas autorizadas y plantas de reciclaje técnico en Bolivia. Acceden de forma exclusiva a dispositivos clasificados como chatarra electrónica no reparable para extraer polímeros y metales de valor comercial.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link to="/register" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#00b0ca] uppercase hover:underline">
                  Verificar Licencia Técnica <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE DE INNOVACIÓN TECNOLÓGICA (Nuestras Herramientas Reales) */}
      <section className="py-20 md:py-28 px-6 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#00b0ca] font-extrabold uppercase tracking-widest text-xs">Núcleo Inteligente</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-3 tracking-tight">
              Innovación Tecnológica para el Diagnóstico
            </h2>
            <p className="text-slate-500 mt-4 text-base md:text-lg">
              Explora las herramientas de auditoría de hardware integradas en nuestra plataforma. Clasificamos cada dispositivo automáticamente para asegurar transparencia absoluta.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Selector de Herramientas (Izquierda - Col 4) */}
            <div className="lg:col-span-4 space-y-3">
              {[
                { id: 'ia-health', name: 'Evaluación de Salud con IA', icon: <Activity size={18} /> },
                { id: 'visual-diag', name: 'Taller Técnico Visual', icon: <Wrench size={18} /> },
                { id: '3d-scanner', name: 'Escáner 3D de Componentes', icon: <Scan size={18} /> },
                { id: 'smart-chat', name: 'Mensajería Inteligente', icon: <MessageSquare size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-6 py-4.5 rounded-2xl text-left text-sm font-black transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-[#00b0ca] shadow-md border-l-4 border-[#00b0ca]'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-[#00b0ca]' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Panel de Visualización del Contenido (Derecha - Col 8) */}
            <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[460px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Badge + Título */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-[#00b0ca]/10 text-[#00b0ca] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      {toolsData[activeTab].badge}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                      {toolsData[activeTab].icon}
                      {toolsData[activeTab].title}
                    </h3>
                  </div>

                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {toolsData[activeTab].description}
                  </p>

                  {/* Render Dinámico del Contenido Técnico según la Pestaña Activa */}
                  {activeTab === 'ia-health' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {toolsData['ia-health'].steps.map((step, idx) => (
                        <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-3">
                          <span className="bg-[#00b0ca]/15 text-[#00b0ca] text-xs font-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{step.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'visual-diag' && (
                    <div className="space-y-3 mt-4">
                      {toolsData['visual-diag'].features.map((feat, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00b0ca] mt-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-extrabold text-slate-800">{feat.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === '3d-scanner' && (
                    <div className="space-y-3 mt-4">
                      {toolsData['3d-scanner'].features.map((feat, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00b0ca] mt-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-extrabold text-slate-800">{feat.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'smart-chat' && (
                    <div className="space-y-3.5 mt-4">
                      {toolsData['smart-chat'].rules.map((rule, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4 justify-between">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol: {rule.role}</span>
                            <p className="text-sm font-extrabold text-slate-800 mt-0.5">{rule.desc}</p>
                          </div>
                          <div className="bg-[#00b0ca]/10 border border-[#00b0ca]/25 text-[#00b0ca] px-3.5 py-1.5 rounded-xl text-xs font-black flex-shrink-0">
                            {rule.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-4 rounded-2xl bg-cyan-50/30 border border-[#00b0ca]/15 text-xs text-slate-600 font-medium">
                    <span className="font-extrabold text-[#00b0ca] uppercase block mb-1">Resultado de Auditoría:</span>
                    {toolsData[activeTab].resultInfo}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <Link
                  to={toolsData[activeTab].path}
                  className="bg-slate-900 hover:bg-[#00b0ca] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 active:scale-95"
                >
                  {toolsData[activeTab].btnText} <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PANEL DE ESTADÍSTICAS GLOBALES (Datos del Admin Dashboard) */}
      <section className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Texto explicativo (Col 5) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[#00b0ca] font-extrabold uppercase tracking-widest text-xs">Métricas de Impacto</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Estadísticas del Dashboard y Catálogo Real
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Toda publicación de hardware genera automáticamente métricas acumulativas reflejadas en el Panel de Administración de ReUseTech. Impulsamos la minería urbana con trazabilidad medible en el departamento de Cochabamba.
              </p>
              <div className="pt-4">
                <Link to="/catalogo" className="bg-[#00b0ca] hover:bg-[#009cb3] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 w-fit">
                  Ver Dispositivos Registrados <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Cuadrícula de Contadores (Col 7) */}
            <div className="lg:col-span-7 bg-slate-50/50 p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <div className="absolute top-[-2%] right-[-2%] w-[150px] h-[150px] bg-[#00b0ca]/5 rounded-full blur-2xl pointer-events-none" />

              {/* Registro 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="bg-cyan-50 text-[#00b0ca] p-3 rounded-xl w-fit">
                  <Cpu size={22} />
                </div>
                <div className="mt-6">
                  <h3 className="text-4xl font-black text-slate-950 tracking-tight">+22</h3>
                  <p className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mt-1.5">Equipos Registrados</p>
                </div>
              </div>

              {/* Registro 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit">
                  <Users size={22} />
                </div>
                <div className="mt-6">
                  <h3 className="text-4xl font-black text-slate-950 tracking-tight">+11</h3>
                  <p className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mt-1.5">Usuarios Activos</p>
                </div>
              </div>

              {/* Registro 3 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="bg-green-50 text-green-600 p-3 rounded-xl w-fit">
                  <Leaf size={22} />
                </div>
                <div className="mt-6">
                  <h3 className="text-4xl font-black text-slate-950 tracking-tight">7,040 kg</h3>
                  <p className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mt-1.5">CO₂ Mitigado Estimado</p>
                </div>
              </div>

              {/* Registro 4 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit">
                  <Globe size={22} />
                </div>
                <div className="mt-6">
                  <h3 className="text-4xl font-black text-slate-950 tracking-tight">330</h3>
                  <p className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mt-1.5">Árboles Equivalentes</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. FOOTER Y NAVEGACIÓN LIMPIA */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Columna Logo/Firma */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-[#00b0ca] p-2 rounded-xl text-white">
                  <span className="text-xl">♻</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  ReUse<span className="text-[#00b0ca]">Tech</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rehabilitación inteligente de hardware y fomento de minería urbana en Bolivia. Tecnología con impacto social.
              </p>
            </div>

            {/* Columna Enlaces */}
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/catalogo" className="hover:text-white transition-colors">Catálogo de Dispositivos</Link></li>
                <li><button onClick={handlePublishClick} className="hover:text-white transition-colors text-left">Publicar Equipo</button></li>
                <li><Link to="/bandeja" className="hover:text-white transition-colors">Bandeja de Entrada</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
              </ul>
            </div>

            {/* Columna Tecnología */}
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Tecnología IA</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/diagnostico-sistemas" className="hover:text-white transition-colors">Evaluación de Salud</Link></li>
                <li><Link to="/diagnostico" className="hover:text-white transition-colors">Taller Visual (TF.js)</Link></li>
                <li><Link to="/escaner" className="hover:text-white transition-colors">Escáner de Componentes</Link></li>
                <li><Link to="/soporte" className="hover:text-white transition-colors">Asistente Virtual</Link></li>
              </ul>
            </div>

            {/* Columna Legal */}
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Políticas y Seguridad</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/privacidad" className="hover:text-white transition-colors">Privacidad de Datos</Link></li>
                <li><Link to="/terminos" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
                <li className="flex items-center gap-1.5 text-[10px] bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg w-fit text-slate-300">
                  <Shield size={12} className="text-[#00b0ca]" /> Conexión SSL Segura
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-semibold">
            <p>© 2026 ReUseTech. Todos los derechos reservados.</p>
            <p>Hecho con 💚 para la preservación ambiental en Cochabamba, Bolivia.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;