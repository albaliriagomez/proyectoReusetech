import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench as Tools, 
  Cpu, 
  Heart, 
  Recycle, 
  CheckCircle, 
  ChevronRight, 
  Sparkles, 
  Droplet as Droplets, 
  Leaf 
} from 'lucide-react';

// ─── Inject styles ────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('diag-styles')) return;
  const s = document.createElement('style');
  s.id = 'diag-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

    .diag { font-family: 'Plus Jakarta Sans', sans-serif; }
    .diag *, .diag *::before, .diag *::after { box-sizing: border-box; }

    /* Glass card */
    .diag-glass {
      background: rgba(255,255,255,0.78);
      backdrop-filter: blur(28px);
      border: 1px solid rgba(255,255,255,0.7);
      border-radius: 2.5rem;
      box-shadow: 0 32px 80px -16px rgba(0,0,0,0.09), 0 0 0 1px rgba(49,194,219,.07);
    }

    /* Progress bar */
    .diag-bar { height:6px; background:#F1F5F9; border-radius:99px; overflow:hidden; }
    .diag-bar-fill { height:100%; background:linear-gradient(90deg,#31C2DB,#1DA8BF); border-radius:99px; transition:width .5s cubic-bezier(.4,0,.2,1); }

    /* Option cards */
    .diag-opt {
      padding:1.35rem 1.5rem; background:#F8FAFC;
      border:2px solid #F1F5F9; border-radius:1.5rem;
      cursor:pointer; transition:all .22s; display:flex;
      align-items:center; justify-content:space-between; gap:1rem;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    .diag-opt:hover {
      border-color:#31C2DB; background:#fff;
      box-shadow:0 8px 32px rgba(49,194,219,.14);
      transform:translateY(-2px);
    }
    .diag-opt:hover .diag-opt-label { color:#31C2DB; }
    .diag-opt:hover .diag-opt-arrow { color:#31C2DB; transform:translateX(4px); }
    .diag-opt-label { font-weight:800; font-size:.95rem; color:#334155; transition:color .2s; }
    .diag-opt-arrow { color:#CBD5E1; transition:all .2s; }

    /* Text input */
    .diag-input {
      width:100%; padding:1.2rem 1.5rem; background:#F8FAFC;
      border:2px solid #F1F5F9; border-radius:1.5rem; outline:none;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:800;
      font-size:1.1rem; color:#0F172A; transition:all .22s;
    }
    .diag-input:focus { border-color:#31C2DB; background:#fff; box-shadow:0 0 0 4px rgba(49,194,219,.1); }
    .diag-input::placeholder { color:#CBD5E1; font-weight:600; }

    /* Result score bar */
    .diag-score-bar { height:10px; background:#F1F5F9; border-radius:99px; overflow:hidden; }
    .diag-score-fill { height:100%; background:linear-gradient(90deg,#31C2DB,#1DA8BF); border-radius:99px; }

    /* Stat cards */
    .diag-stat {
      padding:1.5rem; border-radius:1.75rem; border:1px solid transparent;
    }
    .diag-stat-green { background:#F0FDF4; border-color:#BBF7D0; }
    .diag-stat-blue  { background:#EFF6FF; border-color:#BFDBFE; }

    /* Mineral pills */
    .diag-pill {
      padding:.3rem .85rem; background:#fff; border-radius:99px;
      font-size:.68rem; font-weight:800; color:#1E40AF;
      border:1px solid #BFDBFE; font-family:'Plus Jakarta Sans',sans-serif;
      letter-spacing:.04em; text-transform:uppercase;
    }

    /* Restart btn */
    .diag-restart {
      width:100%; padding:1.25rem; background:#0F172A; color:#fff;
      border:none; border-radius:1.5rem; cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:800;
      font-size:.82rem; letter-spacing:.18em; text-transform:uppercase;
      transition:all .25s; box-shadow:0 8px 32px rgba(15,23,42,.18);
    }
    .diag-restart:hover { background:#31C2DB; box-shadow:0 12px 36px rgba(49,194,219,.3); transform:translateY(-2px); }

    /* Spinner */
    @keyframes diag-spin { to { transform: rotate(360deg); } }
    .diag-spinner {
      width:80px; height:80px; border-radius:50%;
      border:4px solid rgba(49,194,219,.15);
      border-top-color:#31C2DB;
      animation: diag-spin .9s linear infinite;
    }

    /* Step icon wrapper */
    .diag-icon-wrap {
      width:3rem; height:3rem; background:#E8F9FC;
      border-radius:1rem; display:flex; align-items:center; justify-content:center;
      flex-shrink:0;
    }

    /* Result icon */
    .diag-result-icon {
      width:6rem; height:6rem; background:#E8F9FC;
      border-radius:2rem; display:flex; align-items:center; justify-content:center;
      margin:0 auto 1.5rem;
    }

    /* Chip brand */
    .diag-chip {
      display:inline-flex; align-items:center; gap:.4rem;
      padding:.3rem .9rem; border-radius:99px;
      background:#E8F9FC; color:#1DA8BF;
      font-size:.7rem; font-weight:800;
      font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:.05em;
    }
  `;
  document.head.appendChild(s);
};

// ─── Component ────────────────────────────────────────────────────────
const DiagnosticoInteligente = () => {
  // Inject styles once
  React.useEffect(() => { injectStyles(); }, []);

  // ── State (idéntico al original) ────────────────────────────────────
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [datos, setDatos] = useState({
    dispositivo: '', enciende: '', estadoFisico: '', bateria: '', antiguedad: ''
  });

  // ── Pasos (idéntico al original) ────────────────────────────────────
  const pasos = [
    { id: 'dispositivo', q: '¿Qué vas a diagnosticar?', type: 'text', placeholder: 'Ej: Laptop HP, Samsung S21...', icon: <Cpu size={22} color="#31C2DB" /> },
    { id: 'enciende', q: '¿El equipo enciende?', type: 'choice', options: ['Sí', 'No', 'A veces'], icon: <Sparkles size={22} color="#31C2DB" /> },
    { id: 'estadoFisico', q: '¿Estado de la pantalla/carcasa?', type: 'choice', options: ['Perfecto', 'Rayado', 'Roto/Estrellado'], icon: <Tools size={22} color="#31C2DB" /> },
    { id: 'bateria', q: '¿Cómo rinde la batería?', type: 'choice', options: ['Dura bien', 'Dura poco', 'No carga'], icon: <Droplets size={22} color="#31C2DB" /> },
    { id: 'antiguedad', q: '¿Antigüedad del equipo?', type: 'choice', options: ['0-2 años', '3-5 años', 'Más de 5 años'], icon: <ChevronRight size={22} color="#31C2DB" /> },
  ];

  // ── handleNext (idéntico al original) ───────────────────────────────
  const handleNext = (val) => {
    const currentId = pasos[step].id;
    const nuevosDatos = { ...datos, [currentId]: val };
    setDatos(nuevosDatos);
    if (step < pasos.length - 1) setStep(step + 1);
    else simularAnalisis(nuevosDatos);
  };

  // ── simularAnalisis (idéntico al original) ───────────────────────────
  const simularAnalisis = (finalData) => {
    setLoading(true);
    setTimeout(() => {
      let recomendacion = "";
      let puntaje = 0;
      let descripcion = "";
      let Icono = CheckCircle;

      if (finalData.enciende === 'No' && finalData.estadoFisico === 'Roto/Estrellado') {
        recomendacion = "PARA RECICLAR";
        puntaje = 12;
        descripcion = `Daños estructurales críticos detectados. Recomendamos desmantelamiento para recuperación de polímeros y metales base.`;
        Icono = Recycle;
      } else if (finalData.enciende === 'No' || finalData.bateria === 'No carga') {
        recomendacion = "PARA REPUESTOS";
        puntaje = 35;
        descripcion = `Componentes modulares (LCD, teclados, módulos) aptos para donación de órganos técnicos a otros equipos.`;
        Icono = Tools;
      } else if (finalData.antiguedad === 'Más de 5 años' || finalData.estadoFisico === 'Rayado') {
        recomendacion = "PARA DONAR";
        puntaje = 58;
        descripcion = `Funcionalidad estable para requerimientos básicos. Ideal para proyectos de alfabetización digital social.`;
        Icono = Heart;
      } else {
        recomendacion = "PARA REPARAR";
        puntaje = 88;
        descripcion = `Potencial de reuso óptimo. Una intervención técnica estándar lo devolvería al mercado secundario premium.`;
        Icono = Cpu;
      }

      setResultado({
        puntaje,
        descripcion,
        recomendacion,
        Icono,
        co2: finalData.dispositivo.toLowerCase().includes('lap') ? 320 : 65,
        arboles: finalData.dispositivo.toLowerCase().includes('lap') ? 15 : 3,
        materiales: [{ n: 'Cobre', v: '15g' }, { n: 'Oro', v: '0.02g' }, { n: 'Litio', v: '5g' }]
      });
      setLoading(false);
    }, 2500);
  };

  const progressPct = ((step + 1) / pasos.length) * 100;

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="diag" style={{ minHeight: '100vh', background: '#F4F7F9', padding: '3rem 1rem', position: 'relative', overflow: 'hidden' }}>

      {/* Blobs de fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'rgba(49,194,219,.1)', borderRadius: '50%', filter: 'blur(110px)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-5%', width: '35%', height: '35%', background: 'rgba(29,168,191,.07)', borderRadius: '50%', filter: 'blur(100px)' }} />
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Top badge */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="diag-chip">
              <Tools size={13} /> Diagnóstico IA · Protocol v3.0
            </span>
          </div>

          {/* Dark header card */}
          <div style={{
            background: '#0F172A', borderRadius: '2.5rem 2.5rem 0 0',
            padding: '2.5rem 2.5rem 2rem',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow accent */}
            <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '180%', background: 'rgba(49,194,219,.08)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: .15, type: 'spring', stiffness: 240 }}
                style={{
                  display: 'inline-flex', padding: '1rem',
                  background: 'rgba(49,194,219,.12)',
                  border: '1px solid rgba(49,194,219,.25)',
                  borderRadius: '1.25rem', marginBottom: '1rem',
                }}
              >
                <Tools size={36} color="#31C2DB" strokeWidth={1.6} />
              </motion.div>
              <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.2rem)', color: '#fff', letterSpacing: '-.03em', margin: '0 0 .4rem' }}>
                Diagnóstico <span style={{ color: '#31C2DB' }}>Inteligente</span>
              </h2>
              <p style={{ fontSize: '.75rem', fontWeight: 800, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.28em', margin: 0 }}>
                ReUseTech · IA Lab
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN CARD ── */}
        <div style={{
          background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,.7)',
          borderRadius: '0 0 2.5rem 2.5rem',
          boxShadow: '0 32px 80px -16px rgba(0,0,0,.08)',
          padding: '2.5rem 2rem 2rem',
        }}>
          <AnimatePresence mode="wait">

            {/* ── LOADING ── */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: '4rem 0', textAlign: 'center' }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
                  <div className="diag-spinner" />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={28} color="#31C2DB" />
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0F172A', marginBottom: '.4rem', letterSpacing: '-.01em' }}>
                  Analizando hardware…
                </div>
                <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.2em' }}>
                  Calculando huella de carbono
                </div>
              </motion.div>
            )}

            {/* ── FORM ── */}
            {!loading && !resultado && (
              <motion.div
                key={`form-${step}`}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: .28 }}
              >
                {/* Progress */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#31C2DB', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      Paso {step + 1} de {pasos.length}
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                      {Math.round(progressPct)}%
                    </span>
                  </div>
                  <div className="diag-bar">
                    <motion.div
                      className="diag-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: .5, ease: [.4, 0, .2, 1] }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                  <div className="diag-icon-wrap">
                    {pasos[step].icon}
                  </div>
                  <h3 style={{ fontWeight: 900, fontSize: 'clamp(1.1rem,3vw,1.4rem)', color: '#0F172A', letterSpacing: '-.02em', margin: 0, lineHeight: 1.2 }}>
                    {pasos[step].q}
                  </h3>
                </div>

                {/* Options or text input */}
                <div style={{ display: 'grid', gridTemplateColumns: pasos[step].options ? 'repeat(auto-fill,minmax(180px,1fr))' : '1fr', gap: '.85rem' }}>
                  {pasos[step].options ? (
                    pasos[step].options.map((opt, i) => (
                      <motion.button
                        key={opt}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * .07 }}
                        className="diag-opt"
                        onClick={() => handleNext(opt)}
                      >
                        <span className="diag-opt-label">{opt}</span>
                        <ChevronRight size={18} className="diag-opt-arrow" />
                      </motion.button>
                    ))
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        className="diag-input"
                        placeholder={pasos[step].placeholder}
                        onKeyDown={(e) => e.key === 'Enter' && e.target.value && handleNext(e.target.value)}
                        autoFocus
                      />
                      <span style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.65rem', fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                        Enter ↵
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── RESULTADO ── */}
            {resultado && (
              <motion.div
                key="resultado"
                initial={{ opacity: 0, scale: .95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .4, type: 'spring', stiffness: 200 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
              >
                {/* Veredicto */}
                <div style={{ textAlign: 'center' }}>
                  <div className="diag-result-icon">
                    <resultado.Icono size={44} color="#31C2DB" />
                  </div>
                  <p style={{ fontSize: '.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.28em', marginBottom: '.5rem' }}>
                    Dictamen Final
                  </p>
                  <h3 style={{ fontWeight: 900, fontSize: 'clamp(2rem,6vw,3rem)', color: '#31C2DB', letterSpacing: '-.04em', margin: '0 0 1.25rem', lineHeight: 1 }}>
                    {resultado.recomendacion}
                  </h3>
                  <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '1.5rem', padding: '1.25rem 1.5rem', fontStyle: 'italic', color: '#64748B', fontWeight: 600, lineHeight: 1.65, fontSize: '.9rem' }}>
                    "{resultado.descripcion}"
                  </div>
                </div>

                {/* Score */}
                <div style={{ background: '#0F172A', borderRadius: '2rem', padding: '1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: '40%', height: '200%', background: 'rgba(49,194,219,.08)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontWeight: 800, color: 'rgba(255,255,255,.7)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                      Puntaje de Reutilización
                    </span>
                    <span style={{ fontWeight: 900, fontSize: '2.2rem', color: '#31C2DB', lineHeight: 1 }}>
                      {resultado.puntaje}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,.08)', borderRadius: '99px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${resultado.puntaje}%` }}
                      transition={{ delay: .3, duration: .9, ease: [.4, 0, .2, 1] }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #31C2DB, #1DA8BF)', borderRadius: '99px' }}
                    />
                  </div>
                </div>

                {/* Impacto ambiental */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                    <Leaf size={17} color="#22C55E" />
                    <span style={{ fontWeight: 800, fontSize: '.72rem', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                      Impacto Ambiental ReUseTech
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* CO2 */}
                    <div className="diag-stat diag-stat-green">
                      <p style={{ fontSize: '.65rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.35rem' }}>CO₂ Evitado</p>
                      <p style={{ fontWeight: 900, fontSize: '1.9rem', color: '#14532D', lineHeight: 1, margin: '0 0 .35rem' }}>{resultado.co2} kg</p>
                      <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'rgba(20,83,45,.55)', margin: 0 }}>≈ {resultado.arboles} árboles salvados</p>
                    </div>
                    {/* Minerales */}
                    <div className="diag-stat diag-stat-blue">
                      <p style={{ fontSize: '.65rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.75rem' }}>Recuperación de Minerales</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                        {resultado.materiales.map(m => (
                          <span key={m.n} className="diag-pill">{m.n}: {m.v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Restart */}
                <button
                  className="diag-restart"
                  onClick={() => window.location.reload()}
                >
                  Nuevo Análisis Técnico
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticoInteligente;