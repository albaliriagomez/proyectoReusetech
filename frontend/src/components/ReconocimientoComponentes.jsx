import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCamera, FaMicrochip, FaTimes, FaDiceD6,
  FaCheckCircle, FaExclamationTriangle, FaArrowRight,
  FaRecycle, FaTools, FaCheck,
} from "react-icons/fa";
import * as THREE from "three";

// ─── Inject styles ────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("rc-styles-final")) return;
  const s = document.createElement("style");
  s.id = "rc-styles-final";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

    .rc { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
    .rc *, .rc *::before, .rc *::after { box-sizing: border-box; }

    @media (max-width: 768px) {
      .rc-layout { grid-template-columns: 1fr !important; }
      .rc-viewer { height: auto !important; max-height: 350px !important; min-height: 240px !important; }
      .rc-header { padding: 1.5rem 1.25rem !important; }
    }

    .rc-header {
      background: #0F172A;
      border-radius: 2rem 2rem 0 0;
      padding: 2.25rem 2.5rem;
      position: relative; overflow: hidden;
    }

    .rc-viewer {
      background: #F1F5F9;
      border-radius: 1.5rem;
      overflow: hidden;
      position: relative;
      height: 400px;
      width: 100%;
      display: flex; align-items: center; justify-content: center;
    }

    .rc-btn-outline {
      flex: 1; padding: .9rem 1.25rem;
      background: transparent; color: #31C2DB;
      border: 2px solid #31C2DB; border-radius: 1.1rem;
      font-weight: 800; font-size: .88rem; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
      transition: all .22s;
      font-family: inherit;
    }
    .rc-btn-outline:hover { background: #E8F9FC; }

    .rc-btn-primary {
      flex: 1; padding: .9rem 1.25rem;
      background: #0F172A; color: #fff;
      border: none; border-radius: 1.1rem;
      font-weight: 800; font-size: .88rem; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
      transition: all .22s; box-shadow: 0 8px 24px rgba(15,23,42,.18);
      font-family: inherit;
    }
    .rc-btn-primary:hover { background: #31C2DB; transform: translateY(-2px); }

    .rc-reset {
      position: absolute; top: .85rem; right: .85rem;
      width: 2.2rem; height: 2.2rem; border-radius: 50%;
      background: rgba(244,67,54,.1); border: 1.5px solid #F44336;
      color: #F44336; cursor: pointer; z-index: 11;
      display: flex; align-items: center; justify-content: center;
    }

    .rc-bar { height: 6px; border-radius: 99px; background: #E2E8F0; overflow: hidden; }
    .rc-bar-fill { height: 100%; border-radius: 99px; transition: width .3s ease; }

    .rc-overlay {
      position: absolute; inset: 0; z-index: 10;
      background: rgba(49,194,219,.82);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 1.25rem;
    }
    @keyframes rc-spin { to { transform: rotate(360deg); } }
    .rc-spinner {
      width: 60px; height: 60px; border-radius: 50%;
      border: 4px solid rgba(255,255,255,.25);
      border-top-color: #fff;
      animation: rc-spin .9s linear infinite;
    }

    /* ── Tarjeta de Componente con 3D ── */
    .rc-comp-card {
      display: flex; align-items: stretch;
      background: #fff; border-radius: 1.25rem;
      border: 1.5px solid #F1F5F9; overflow: hidden;
      transition: all .22s; margin-bottom: .85rem;
      min-height: 112px;
    }
    .rc-comp-card:hover {
      border-color: var(--accent);
      box-shadow: 0 6px 24px rgba(0,0,0,.07);
      transform: translateY(-2px);
    }
    .rc-comp-3d {
      width: 100px; min-width: 100px;
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-right: 1px solid #F1F5F9;
    }

    .rc-chip {
      display: inline-flex; align-items: center; gap: .3rem;
      padding: .2rem .65rem; border-radius: 99px;
      font-size: .62rem; font-weight: 800;
      letter-spacing: .04em; text-transform: uppercase;
    }

    /* ── Recomendación ── */
    .rc-recom {
      border-radius: 1.5rem;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
      border: 2px solid;
      position: relative; overflow: hidden;
    }
    .rc-recom-icon {
      width: 56px; height: 56px;
      border-radius: 1rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem;
      margin-bottom: 1rem;
    }
    .rc-recom-action-btn {
      width: 100%; padding: 1rem 1.25rem;
      border: none; border-radius: 1rem;
      font-weight: 800; font-size: .95rem; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
      transition: all .22s;
      margin-top: 1rem;
      font-family: inherit;
    }
    .rc-recom-action-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.15); }

    /* ── Checklist ── */
    .rc-section-title {
      font-weight: 900; font-size: 1rem; color: #0F172A;
      margin-bottom: 1rem; display: flex; align-items: center; gap: .5rem;
    }
    .rc-checklist-item {
      display: flex; align-items: center; gap: .8rem;
      padding: .85rem 1rem;
      border-radius: .9rem;
      border: 1.5px solid #F1F5F9;
      margin-bottom: .55rem;
      background: #fff;
    }
    .rc-checklist-icon {
      width: 28px; height: 28px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .85rem; flex-shrink: 0;
    }

    /* ── Sugerencias de fotos ── */
    .rc-photo-tip {
      background: #FAFCFD;
      border: 1.5px dashed #CBD5E1;
      border-radius: .9rem;
      padding: .85rem 1rem;
      margin-bottom: .55rem;
      display: flex; align-items: flex-start; gap: .65rem;
      font-size: .82rem; color: #475569;
      line-height: 1.5;
    }
    .rc-photo-tip-priority {
      background: #FEF3C7; border-color: #F59E0B; color: #92400E;
    }

    /* ── Stats mini ── */
    .rc-stat {
      flex: 1; padding: 1rem;
      background: #fff; border-radius: 1.1rem;
      border: 1px solid #F1F5F9; text-align: center;
    }
    .rc-summary {
      background: linear-gradient(135deg, rgba(49,194,219,.07) 0%, rgba(29,168,191,.12) 100%);
      border: 1px solid rgba(49,194,219,.2);
      border-radius: 1.5rem; padding: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .rc-label { font-size: .65rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: .08em; }

    /* ── Banner demo ── */
    .rc-demo-banner {
      background: #FEF3C7;
      border: 1.5px solid #F59E0B;
      border-radius: 1rem;
      padding: .75rem 1rem;
      margin-bottom: 1rem;
      display: flex; align-items: center; gap: .65rem;
      font-size: .78rem; font-weight: 700; color: #92400E;
    }

    .rc-list {
      padding-right: .25rem;
    }

    .rc-empty { text-align: center; padding: 3.5rem 1.5rem; }

    @media(max-width:680px){
      .rc-layout { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(s);
};

// ─── Paleta ────────────────────────────────────────────
const C = {
  bg: "#F4F7F9", primary: "#31C2DB", primaryD: "#1DA8BF",
  text: "#0F172A", green: "#22C55E", orange: "#F59E0B", red: "#F44336",
};

// ─── Mapeo de componente → tipo de modelo 3D ────────────
const TYPE_MAP = (nombre = "") => {
  const n = nombre.toLowerCase();
  if (n.includes("pantalla")) return "screen";
  if (n.includes("teclado")) return "keyboard";
  if (n.includes("touchpad") || n.includes("panel")) return "touchpad";
  if (n.includes("cámara") || n.includes("camara") || n.includes("web")) return "camera";
  if (n.includes("bisagra")) return "hinge";
  if (n.includes("botón") || n.includes("boton")) return "button";
  if (n.includes("puerto") || n.includes("carga")) return "port";
  return "chip";
};

// ─── Color según confianza ──────────────────────────────
const COLOR_FOR_CONF = (confNum = 0) => {
  if (confNum >= 0.75) return C.green;
  if (confNum >= 0.50) return C.primary;
  if (confNum >= 0.30) return C.orange;
  return C.red;
};

// ─── Componente 3D (con modelos para cada tipo) ──────────
const ComponentModel3D = ({ type, color = C.primary }) => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth || 100;
    const h = mountRef.current.clientHeight || 112;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(new THREE.Color(color), 2.2);
    dir.position.set(5, 5, 5); scene.add(dir);
    const back = new THREE.DirectionalLight(0xffffff, 0.4);
    back.position.set(-5, -5, -5); scene.add(back);
    const pt = new THREE.PointLight(new THREE.Color(color), 1.2, 10);
    pt.position.set(0, 2, 2); scene.add(pt);

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color), metalness: 0.8, roughness: 0.2,
      emissive: new THREE.Color(color), emissiveIntensity: 0.15,
    });

    let mesh;
    const buildMesh = (geo) => { mesh = new THREE.Mesh(geo, mat); scene.add(mesh); };

    switch (type) {
      case "screen": {
        // Marco de pantalla
        buildMesh(new THREE.BoxGeometry(2.2, 1.4, 0.08));
        // Vidrio interior
        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 1.2, 0.02),
          new THREE.MeshStandardMaterial({
            color: 0x000000, metalness: 0.9, roughness: 0.05,
            emissive: new THREE.Color(color), emissiveIntensity: 0.3
          })
        );
        glass.position.z = 0.05;
        scene.add(glass);
        break;
      }
      case "keyboard": {
        // Base del teclado
        buildMesh(new THREE.BoxGeometry(2.4, 0.18, 1.0));
        // Teclas
        for (let x = -0.95; x <= 0.95; x += 0.22) {
          for (let z = -0.32; z <= 0.32; z += 0.20) {
            const key = new THREE.Mesh(
              new THREE.BoxGeometry(0.16, 0.08, 0.13),
              new THREE.MeshStandardMaterial({
                color: 0x222222, roughness: 0.7, metalness: 0.2
              })
            );
            key.position.set(x, 0.13, z);
            scene.add(key);
          }
        }
        break;
      }
      case "touchpad": {
        // Marco
        buildMesh(new THREE.BoxGeometry(1.8, 0.08, 1.2));
        // Superficie táctil
        const surface = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.04, 1.0),
          new THREE.MeshStandardMaterial({
            color: 0x444444, metalness: 0.6, roughness: 0.3,
            emissive: new THREE.Color(color), emissiveIntensity: 0.05
          })
        );
        surface.position.y = 0.06;
        scene.add(surface);
        break;
      }
      case "camera": {
        // Anillo exterior
        buildMesh(new THREE.CylinderGeometry(0.5, 0.5, 0.25, 32));
        // Lente
        const lens = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.28, 32),
          new THREE.MeshStandardMaterial({
            color: 0x000000, metalness: 0.95, roughness: 0.05,
            emissive: new THREE.Color(color), emissiveIntensity: 0.4
          })
        );
        scene.add(lens);
        // Reflejo
        const reflect = new THREE.Mesh(
          new THREE.CircleGeometry(0.1, 16),
          new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true })
        );
        reflect.position.set(0.1, 0.15, 0);
        reflect.rotation.x = -Math.PI / 2;
        scene.add(reflect);
        break;
      }
      case "hinge": {
        // Cilindro principal
        buildMesh(new THREE.CylinderGeometry(0.22, 0.22, 2.0, 32));
        // Detalles laterales
        [-0.85, 0.85].forEach(y => {
          const ring = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.28, 0.15, 32),
            new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 1, roughness: 0.1 })
          );
          ring.position.y = y;
          scene.add(ring);
        });
        break;
      }
      case "button": {
        // Botón circular
        buildMesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32));
        // Anillo decorativo
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.4, 0.04, 8, 32),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(color), metalness: 1, roughness: 0.1,
            emissive: new THREE.Color(color), emissiveIntensity: 0.3
          })
        );
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        break;
      }
      case "port": {
        // Puerto USB-C / cargador
        buildMesh(new THREE.BoxGeometry(0.8, 0.35, 0.25));
        // Hueco interior
        const hole = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.18, 0.27),
          new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9 })
        );
        scene.add(hole);
        break;
      }
      default: {
        // Chip genérico
        buildMesh(new THREE.BoxGeometry(1.5, 0.3, 1.5));
        // Detalles tipo pines
        for (let x = -0.6; x <= 0.6; x += 0.3) {
          const pin = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.1, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 1 })
          );
          pin.position.set(x, -0.18, 0.7);
          scene.add(pin);
        }
      }
    }

    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.01;
      scene.children.forEach((obj) => {
        if (obj.type === "Mesh") {
          obj.rotation.y = t;
          obj.rotation.x = Math.sin(t * 0.4) * 0.25;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const mountNode = mountRef.current;
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mountNode && renderer.domElement.parentNode === mountNode)
        mountNode.removeChild(renderer.domElement);
    };
  }, [type, color]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

// ─── Tarjeta de Componente con 3D ──────────────────────
const ComponentCard = ({ comp, index }) => {
  const [hovered, setHovered] = useState(false);
  const modelType = TYPE_MAP(comp.nombre);
  const accentColor = COLOR_FOR_CONF(comp.confianza_num);
  const pct = Math.round((comp.confianza_num || 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 130 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="rc-comp-card"
        style={{
          "--accent": accentColor,
          borderColor: hovered ? accentColor : "#F1F5F9",
          boxShadow: hovered ? `0 8px 28px ${accentColor}22` : "none",
        }}
      >
        <div className="rc-comp-3d">
          <ComponentModel3D type={modelType} color={accentColor} />
        </div>

        <div style={{ padding: "1rem 1.1rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".4rem" }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: ".88rem", color: "#0F172A", lineHeight: 1.3 }}>
                {comp.nombre}
              </span>
              {comp.esencial && (
                <span style={{ marginLeft: ".4rem", fontSize: ".55rem", fontWeight: 800, color: "#1DA8BF", textTransform: "uppercase", letterSpacing: ".06em" }}>
                  · Esencial
                </span>
              )}
            </div>
            <span className="rc-chip" style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>
              {comp.confianza}
            </span>
          </div>

          <div style={{ marginBottom: ".4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".3rem" }}>
              <span style={{ fontSize: ".62rem", fontWeight: 800, color: accentColor, textTransform: "uppercase", letterSpacing: ".08em" }}>
                Detectado · Confianza {pct}%
              </span>
            </div>
            <div className="rc-bar">
              <div className="rc-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}bb)` }} />
            </div>
          </div>

          <span style={{ fontSize: ".72rem", color: "#64748B", fontWeight: 600, lineHeight: 1.5 }}>
            {comp.detalle}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Recomendación accionable ──────────────────────────
const ESTILO_RECOMENDACION = {
  reutilizacion: { bg: '#dcfce7', border: '#22C55E', text: '#166534', iconBg: '#22C55E', btnBg: '#22C55E', btnText: '#fff', icon: <FaCheckCircle color="#fff" /> },
  repuestos:     { bg: '#fef3c7', border: '#F59E0B', text: '#92400E', iconBg: '#F59E0B', btnBg: '#F59E0B', btnText: '#fff', icon: <FaTools color="#fff" /> },
  reciclaje:     { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', iconBg: '#3b82f6', btnBg: '#3b82f6', btnText: '#fff', icon: <FaRecycle color="#fff" /> },
  foto_mala:     { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', iconBg: '#ef4444', btnBg: '#ef4444', btnText: '#fff', icon: <FaCamera color="#fff" /> },
};

const RecomendacionCard = ({ recomendacion, onPublicar }) => {
  const estilo = ESTILO_RECOMENDACION[recomendacion.tipo] || ESTILO_RECOMENDACION.repuestos;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rc-recom" style={{ background: estilo.bg, borderColor: estilo.border }}>
      <div className="rc-recom-icon" style={{ background: estilo.iconBg }}>{estilo.icon}</div>
      <div style={{ fontSize: ".68rem", fontWeight: 800, color: estilo.text, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".25rem" }}>
        Recomendación de la IA
      </div>
      <h3 style={{ fontWeight: 900, fontSize: "1.25rem", color: estilo.text, margin: "0 0 .5rem", lineHeight: 1.2 }}>
        {recomendacion.titulo}
      </h3>
      <p style={{ fontSize: ".88rem", color: estilo.text, opacity: .9, margin: 0, lineHeight: 1.5 }}>
        {recomendacion.mensaje}
      </p>
      {recomendacion.tipo !== 'foto_mala' && (
        <button className="rc-recom-action-btn" style={{ background: estilo.btnBg, color: estilo.btnText }} onClick={() => onPublicar(recomendacion)}>
          {recomendacion.accion_principal.texto}
          <FaArrowRight size={12} />
        </button>
      )}
      {recomendacion.accion_principal.descripcion && (
        <div style={{ fontSize: ".72rem", color: estilo.text, opacity: .75, marginTop: ".5rem", textAlign: "center", fontStyle: "italic" }}>
          {recomendacion.accion_principal.descripcion}
        </div>
      )}
    </motion.div>
  );
};

// ─── Item del Checklist ────────────────────────────────
const ChecklistItem = ({ item, index }) => {
  const colors = item.detectado
    ? { bg: '#dcfce7', icon: '#22C55E', text: '#166534' }
    : item.esencial
      ? { bg: '#fef3c7', icon: '#F59E0B', text: '#92400E' }
      : { bg: '#F1F5F9', icon: '#94A3B8', text: '#64748B' };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rc-checklist-item"
      style={{ borderColor: item.detectado ? '#22C55E40' : '#F1F5F9' }}
    >
      <div className="rc-checklist-icon" style={{ background: colors.bg, color: colors.icon }}>
        {item.detectado ? <FaCheck size={11} /> : <FaTimes size={11} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: "2px" }}>
          <span style={{ fontWeight: 800, fontSize: ".88rem", color: "#0F172A" }}>
            {item.nombre}
          </span>
          {item.esencial && (
            <span style={{ fontSize: ".55rem", fontWeight: 800, color: "#1DA8BF", textTransform: "uppercase", letterSpacing: ".06em" }}>
              · Esencial
            </span>
          )}
        </div>
        <div style={{ fontSize: ".72rem", color: colors.text, fontWeight: 600 }}>
          {item.mensaje}
          {item.confianza && <span style={{ marginLeft: ".4rem", opacity: .7 }}>({item.confianza})</span>}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Tip de foto ───────────────────────────────────────
const PhotoTip = ({ tip, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className={`rc-photo-tip ${tip.prioritaria ? 'rc-photo-tip-priority' : ''}`}
  >
    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{tip.icono}</span>
    <span>{tip.texto}</span>
  </motion.div>
);

// ─── Componente Principal ──────────────────────────────
const EscanerInteligente = () => {
  useEffect(() => { injectStyles(); }, []);
  const navigate = useNavigate();

  const [image, setImage]         = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [resultado, setResultado] = useState(null);
  const [progreso, setProgreso]   = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgreso(0);
      interval = setInterval(() => {
        setProgreso((p) => { if (p >= 88) { clearInterval(interval); return 88; } return p + 11; });
      }, 320);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setResultado(null); }
  };

  const analizarImagen = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://proyectoreusetech-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/analizar-hardware`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.exito) {
        alert(`${data.mensaje || "Error en el análisis"}\n${data.sugerencia || ""}`);
        return;
      }
      setResultado(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const resetear = () => { setPreview(null); setImage(null); setResultado(null); };

  const irAPublicarConSugerencia = (recomendacion) => {
    const sugerenciaIA = {
      categoria:        recomendacion.categoria_sugerida,
      estado:           recomendacion.estado_sugerido,
      tipo_dispositivo: resultado.tipo_dispositivo,
      ia_componentes:   resultado.componentes,
      ia_verificada:    true,
    };
    sessionStorage.setItem('iaSugerencia', JSON.stringify(sugerenciaIA));
    navigate('/publicar');
  };

  const componentes = resultado?.componentes ?? [];
  const total       = componentes.length;
  const esenciales  = componentes.filter(c => c.esencial).length;
  const confianzaPromedio = total > 0
    ? Math.round((componentes.reduce((s, c) => s + (c.confianza_num || 0), 0) / total) * 100)
    : 0;

  return (
    <div className="rc w-full max-w-full overflow-x-hidden px-4 sm:px-6 md:px-8" style={{ minHeight: "100vh", background: C.bg, padding: "2rem 1rem 5rem", position: "relative" }}>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "40%", height: "40%", background: "rgba(49,194,219,.1)", borderRadius: "50%", filter: "blur(110px)" }} />
        <div style={{ position: "absolute", bottom: "-8%", left: "-5%", width: "35%", height: "35%", background: "rgba(29,168,191,.07)", borderRadius: "50%", filter: "blur(100px)" }} />
      </div>

      <div style={{ maxWidth: "1080px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: ".4rem",
              padding: ".3rem .9rem", borderRadius: "99px",
              background: "#E8F9FC", color: "#1DA8BF",
              fontSize: ".68rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase"
            }}>
              <FaMicrochip size={12} /> Escáner Inteligente · IA
            </span>
          </div>

          <div className="rc-header">
            <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: "55%", height: "180%", background: "rgba(49,194,219,.07)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  display: "inline-flex", padding: ".9rem",
                  background: "rgba(49,194,219,.12)", border: "1px solid rgba(49,194,219,.25)",
                  borderRadius: "1.1rem", marginBottom: ".85rem",
                }}
              >
                <FaMicrochip size={30} color="#31C2DB" />
              </motion.div>
              <h1 style={{ fontWeight: 900, fontSize: "clamp(1.4rem,3.5vw,2rem)", color: "#fff", letterSpacing: "-.03em", margin: "0 0 .5rem" }}>
                Escáner <span style={{ color: "#31C2DB" }}>Inteligente</span>
              </h1>
              <p style={{ fontSize: ".85rem", fontWeight: 600, color: "rgba(255,255,255,.55)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
                Sube una foto de tu equipo. La IA verificará los componentes visibles y te dirá exactamente cómo publicarlo para reutilización, repuestos o reciclaje.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── LAYOUT ── */}
        <div className="rc-layout grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* ── COLUMNA IZQUIERDA: VISOR + SUGERENCIAS DE FOTOS ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{
              background: "rgba(255,255,255,.8)", backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,.65)",
              borderRadius: "0 0 2rem 2rem",
              padding: "1.75rem",
            }}>
              <div className="rc-viewer w-full overflow-hidden" style={{ marginBottom: "1.25rem", overflow: "hidden", width: "100%" }}>
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Dispositivo"
                      className="max-w-full h-auto object-contain"
                      style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
                    />
                    {loading && (
                      <div className="rc-overlay">
                        <div className="rc-spinner" />
                        <div>
                          <div style={{ fontWeight: 800, color: "#fff", fontSize: "1rem", textAlign: "center", marginBottom: ".35rem" }}>
                            Analizando con IA…
                          </div>
                          <div style={{ width: "200px", height: "6px", background: "rgba(255,255,255,.25)", borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{ height: "100%", background: "#fff", width: `${progreso}%`, transition: "width .3s" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <button className="rc-reset" onClick={resetear}><FaTimes size={12} /></button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <motion.div
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      style={{ marginBottom: "1rem" }}
                    >
                      <FaDiceD6 size={68} color="#CBD5E1" />
                    </motion.div>
                    <div style={{ fontWeight: 800, color: "#94A3B8", fontSize: ".95rem", marginBottom: ".35rem" }}>
                      Sube una foto de tu equipo
                    </div>
                    <div style={{ fontSize: ".78rem", color: "#CBD5E1", fontWeight: 600 }}>
                      Laptop, celular, tablet…
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="rc-btn-outline" onClick={() => fileInputRef.current.click()}>
                  <FaCamera size={14} /> Cargar imagen
                </button>
                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                {preview && !loading && (
                  <button className="rc-btn-primary" onClick={analizarImagen}>
                    <FaMicrochip size={14} /> Analizar con IA
                  </button>
                )}
              </div>

              {/* Sugerencias de fotos (cuando hay resultado) */}
              {resultado?.sugerencias_fotos?.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <div className="rc-section-title">
                    <FaCamera size={14} color="#31C2DB" />
                    <span>Sugerencias de fotos adicionales</span>
                  </div>
                  {resultado.sugerencias_fotos.map((tip, i) => (
                    <PhotoTip key={i} tip={tip} index={i} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── COLUMNA DERECHA: RECOMENDACIÓN + STATS + 3D + CHECKLIST ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{
              background: "rgba(255,255,255,.8)", backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,.65)",
              borderRadius: "0 0 2rem 2rem",
              padding: "1.75rem",
            }}>
              <AnimatePresence mode="wait">
                {resultado ? (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rc-list">

                    {/* Banner modo demo */}
                    {resultado.modo_demo && (
                      <div className="rc-demo-banner">
                        <FaExclamationTriangle size={14} />
                        <span>Modo demostración · Resultados simulados</span>
                      </div>
                    )}

                    {/* 1. RECOMENDACIÓN ACCIONABLE (lo más importante arriba) */}
                    {resultado.recomendacion && (
                      <RecomendacionCard
                        recomendacion={resultado.recomendacion}
                        onPublicar={irAPublicarConSugerencia}
                      />
                    )}

                    {/* 2. STATS RÁPIDAS */}
                    <div className="rc-summary">
                      <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1.1rem" }}>
                        <div style={{ width: "1.75rem", height: "1.75rem", background: "#E8F9FC", borderRadius: ".5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaMicrochip size={13} color="#31C2DB" />
                        </div>
                        <span style={{ fontWeight: 900, fontSize: "1rem", color: "#0F172A" }}>Componentes Detectados</span>
                      </div>

                      <div style={{ display: "flex", gap: ".75rem" }}>
                        {[
                          { label: "Detectados", value: total,                   color: C.primary },
                          { label: "Esenciales", value: esenciales,              color: C.green   },
                          { label: "Confianza",  value: `${confianzaPromedio}%`, color: C.orange  },
                        ].map((stat, i) => (
                          <div key={i} className="rc-stat" style={{ border: `1px solid ${stat.color}20` }}>
                            <div style={{ fontWeight: 900, fontSize: "1.5rem", color: stat.color, lineHeight: 1, marginBottom: ".2rem" }}>
                              {stat.value}
                            </div>
                            <div className="rc-label">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. LISTA DE COMPONENTES CON 3D */}
                    {componentes.length > 0 && (
                      <div style={{ marginBottom: "1.25rem" }}>
                        <div className="rc-section-title">
                          <FaMicrochip size={14} color="#31C2DB" />
                          <span>Componentes con visualización 3D</span>
                        </div>
                        {componentes.map((comp, index) => (
                          <ComponentCard key={index} comp={comp} index={index} />
                        ))}
                      </div>
                    )}

                    {/* 4. CHECKLIST de componentes esperados */}
                    {resultado.checklist?.length > 0 && (
                      <div style={{ marginBottom: "1.25rem" }}>
                        <div className="rc-section-title">
                          <FaCheckCircle size={14} color="#22C55E" />
                          <span>Checklist de componentes</span>
                          <span style={{ fontSize: ".65rem", color: "#94A3B8", fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
                            (Tipo: {resultado.tipo_dispositivo})
                          </span>
                        </div>
                        {resultado.checklist.map((item, i) => (
                          <ChecklistItem key={i} item={item} index={i} />
                        ))}
                      </div>
                    )}

                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ fontWeight: 900, color: "#0F172A", fontSize: "1rem", marginBottom: ".5rem" }}>
                      Análisis pendiente
                    </div>
                    <div style={{ height: "1px", background: "#F1F5F9", marginBottom: "1.5rem" }} />
                    <div className="rc-empty">
                      <FaMicrochip size={46} color="#E2E8F0" style={{ marginBottom: "1rem" }} />
                      <div style={{ fontWeight: 800, color: "#94A3B8", fontSize: ".9rem", marginBottom: ".4rem" }}>
                        Sube una foto para empezar
                      </div>
                      <div style={{ fontSize: ".78rem", color: "#CBD5E1", fontWeight: 600, lineHeight: 1.6 }}>
                        Verás los componentes en 3D,<br />
                        recomendación y sugerencias de fotos
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EscanerInteligente;