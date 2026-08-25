import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Zap, 
  Shield, 
  Battery, 
  Calendar, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  Upload,
  MapPin,
  Check
} from 'lucide-react';
import { API_BASE_URL } from '../api';

// ─── API Key ──────────────────────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = 'AIzaSyDA6ZQGx-Ih-qm7IaIiaPGeKnY7Z4OyRk4';
const backendUrl = API_BASE_URL;

// ─── Estilos globales corporativos ────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('fml-styles')) return;
  const s = document.createElement('style');
  s.id = 'fml-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    :root{
      --brand-dark: #0F172A;
      --accent-cyan: #06B6D4;
      --accent-blue: #2563EB;
      --bg-clean: #F0F9FF;
      --bg-white: #FFFFFF;
      --border: #BAE6FD;
      --border-2: #7DD3FC;
      --muted-bg: #E0F2FE;
      --muted: #94A3B8;
      --muted-text: #64748B;
      --text-mid: #475569;
      --seal-bg: #F0FDFA;
      --seal-border: #99F6E4;
      --seal-icon-bg: #CCFBF1;
      --primary: #06B6D4;
      --primary-dark: #0891B2;
      --primary-light: #E0F2FE;
      --sidebar-active-bg: #E0F2FE;
      --sidebar-active-text: #0891B2;
      --bar-fill: #06B6D4;
    }
    .fml { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
    .fml *, .fml *::before, .fml *::after { box-sizing: border-box; }

    @media (max-width: 768px) {
      .fml-layout { grid-template-columns: 1fr !important; }
      .fml-sidebar { position: relative !important; top: 0 !important; margin-bottom: 1rem; }
      .fml-glass { padding: 1.25rem !important; }
      .fml-cert-seal { flex-direction: column !important; text-align: center !important; }
    }

    .fml-glass {
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      box-shadow: 0 8px 24px -8px rgba(6, 182, 212, 0.08);
    }

    /* Sidebar pills */
    .fml-pill { display:flex; align-items:center; gap:.75rem; padding:.75rem 1rem; border-radius:1rem; transition:all .2s; }
    .fml-pill.active { background: var(--sidebar-active-bg); }
    .fml-pill.active .fml-pill-label { color: var(--sidebar-active-text); }
    .fml-pill.done   .fml-pill-label { color:#22C55E; }
    .fml-pill.idle   .fml-pill-label { color:var(--muted); }
    .fml-pill-num {
      width:1.75rem; height:1.75rem; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-weight:700; font-size:.78rem; flex-shrink:0; transition:all .2s;
    }
    .fml-pill-num.active { background: var(--primary); color:#fff; }
    .fml-pill-num.done   { background:#22C55E; color:#fff; }
    .fml-pill-num.idle   { background:var(--border); color:var(--muted); }
    .fml-pill-label { font-weight:750; font-size:.85rem; line-height:1.2; }
    .fml-pill-sub   { font-size:.68rem; font-weight:600; color:#94A3B8; margin-top:.1rem; }

    /* Inputs */
    .fml-field { display:flex; flex-direction:column; gap:.4rem; }
    .fml-label { font-size:.65rem; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.07em; }
    .fml-input, .fml-select, .fml-textarea {
      width:100%; padding:.85rem 1rem;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:600; font-size:.9rem; color:var(--brand-dark);
      background:var(--bg-clean); border:1px solid var(--border); border-radius:0.75rem;
      outline:none; transition:all .15s; appearance:none;
    }
    .fml-input:focus, .fml-select:focus, .fml-textarea:focus {
      border-color: var(--primary); background:var(--bg-white); box-shadow:0 0 0 3px rgba(6,182,212,.10);
    }
    .fml-input::placeholder, .fml-textarea::placeholder { color:#94A3B8; font-weight:500; }
    .fml-textarea { resize:vertical; min-height:100px; }

    /* Drop zone */
    .fml-drop {
      border:1.5px dashed var(--border-2); border-radius:1rem;
      padding:2rem 1.5rem; text-align:center; cursor:pointer;
      transition:all .15s; background: var(--bg-clean);
    }
    .fml-drop:hover { border-color: var(--primary); background:var(--muted-bg); }

    /* Buttons */
    .fml-btn-primary {
      background: var(--primary); color:#fff; padding:.85rem 1.75rem;
      border-radius:0.75rem; border:none; cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:750; font-size:.9rem;
      display:inline-flex; align-items:center; gap:.5rem;
      transition:all .18s;
    }
    .fml-btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
    .fml-btn-primary:disabled { opacity:.35; cursor:not-allowed; }
    .fml-btn-outline {
      background:transparent; color:var(--text-mid); padding:.85rem 1.5rem;
      border-radius:0.75rem; border:1px solid var(--border-2); cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:750; font-size:.9rem;
      display:inline-flex; align-items:center; gap:.4rem; transition:all .18s;
    }
    .fml-btn-outline:hover:not(:disabled) { background:var(--bg-clean); border-color: var(--primary); color: var(--primary); }
    .fml-btn-outline:disabled { opacity:.3; cursor:not-allowed; }

    /* Progress */
    .fml-bar { height:4px; border-radius:99px; background:var(--muted-bg); overflow:hidden; }
    .fml-bar-fill { height:100%; background: var(--primary); border-radius:99px; transition:width .3s; }

    /* Chips */
    .fml-chip {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.25rem .7rem; border-radius:99px;
      font-size:.65rem; font-weight:800;
      font-family:'Plus Jakarta Sans',sans-serif;
      text-transform: uppercase;
      letter-spacing: .03em;
    }
    .fml-chip-brand { background: #DCFDF5; color: #0E7490; }
    .fml-chip-green { background:#DCFCE7; color:#15803D; }
    .fml-chip-amber { background:#FEF9C3; color:#A16207; }

    /* Summary rows */
    .fml-row { display:flex; flex-direction:column; gap:.25rem; padding:.8rem 0; border-bottom:1px solid var(--muted-bg); }
    .fml-row:last-child { border-bottom:none; }
    .fml-row-label { font-size:.65rem; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; }
    .fml-row-val   { font-size:.88rem; font-weight:700; color:var(--brand-dark); }

    /* Section divider */
    .fml-divider { height:1px; background: var(--muted-bg); margin:1.25rem 0; }

    /* Cuestionario cards */
    .fml-q-card {
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.15s ease-in-out;
      min-height: 100px;
      text-align: center;
    }
    .fml-q-card:hover {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .fml-q-card.active {
      border-color: var(--primary);
      background: var(--primary);
      color: #ffffff !important;
      box-shadow: 0 4px 16px rgba(6, 182, 212, 0.25);
    }
    .fml-q-card.active * {
      color: #ffffff !important;
    }

    /* Sello de Verificación */
    .fml-cert-seal {
      border-radius: 1rem;
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border: 1px solid var(--seal-border);
      background: var(--seal-bg);
      color: var(--brand-dark);
    }
    .fml-cert-seal svg {
      display: block;
      width: 1.45rem;
      height: 1.45rem;
      color: var(--primary);
    }

    /* Responsive */
    @media(max-width:680px){
      .fml-sidebar { display: block; width: 100%; margin-bottom: 1.5rem; position: relative !important; top: 0 !important; }
      .fml-layout  { grid-template-columns:1fr !important; }
      .fml-grid2   { grid-template-columns:1fr !important; }
    }
  `;
  document.head.appendChild(s);
};

// ─── Sidebar component ────────────────────────────────────────────────
const STEPS_META = [
  { label: 'Evaluación de Salud IA', sub: 'Auditoría técnica del hardware' },
  { label: 'Datos de Publicación',   sub: 'Registro de datos e imagen' },
];

const StepSidebar = ({ activeStep }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
    {STEPS_META.map((s, i) => {
      const isActive = (i === 0 && (activeStep === 0 || activeStep === 1)) || (i === 1 && activeStep === 2);
      const isDone = (i === 0 && activeStep === 2);
      const st = isDone ? 'done' : isActive ? 'active' : 'idle';
      return (
        <div key={i} className={`fml-pill ${st}`}>
          <div className={`fml-pill-num ${st}`}>{st === 'done' ? <Check size={12} /> : i + 1}</div>
          <div>
            <div className="fml-pill-label">{s.label}</div>
            <div className="fml-pill-sub">{s.sub}</div>
          </div>
        </div>
      );
    })}
  </div>
);

const Field = ({ label, children }) => (
  <div className="fml-field">
    <span className="fml-label">{label}</span>
    {children}
  </div>
);

// ─── Preguntas del Cuestionario ────────────────────────────────────────
const PREGUNTAS = [
  {
    id: 'dispositivo',
    q: '¿Qué tipo de dispositivo desea evaluar?',
    IconComponent: Monitor,
    options: [
      'Teléfonos y Accesorios',
      'Computadoras y Accesorios',
      'Tablets y Accesorios',
      'Otros'
    ]
  },
  {
    id: 'enciende',
    q: '¿El dispositivo enciende?',
    IconComponent: Zap,
    options: ['Sí', 'No', 'A veces']
  },
  {
    id: 'estadoFisico',
    q: '¿Cuál es el estado físico de la pantalla o carcasa?',
    IconComponent: Shield,
    options: ['Perfecto', 'Rayado', 'Roto/Estrellado']
  },
  {
    id: 'bateria',
    q: '¿Cómo rinde la batería del equipo?',
    IconComponent: Battery,
    options: ['Dura bien', 'Dura poco', 'No carga']
  },
  {
    id: 'antiguedad',
    q: '¿Cuál es la antigüedad aproximada?',
    IconComponent: Calendar,
    options: ['0-2 años', '3-5 años', 'Más de 5 años']
  }
];

// ─── Helper Compresión de Imagen en Cliente (Evita Network Error en Móviles) ────
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof File) || !file.type || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log(`📸 Imagen optimizada en cliente: ${(file.size / 1024).toFixed(1)}KB ➔ ${(compressedFile.size / 1024).toFixed(1)}KB (${width}x${height}px)`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

// ─── Componente principal ─────────────────────────────────────────────
const Formulario = () => {
  useEffect(() => { injectStyles(); }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [estadoSubida, setEstadoSubida] = useState('');
  
  const [currentQ, setCurrentQ] = useState(0);
  const [qaData, setQaData] = useState({
    dispositivo: '',
    enciende: '',
    estadoFisico: '',
    bateria: '',
    antiguedad: ''
  });

  const [loadingIA, setLoadingIA] = useState(false);
  const [diagnosticoResult, setDiagnosticoResult] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    nombredeldispositivo: '',
    marcaoModelo: '',
    categoria: '',
    estado: '',
    descripcion: '',
    contacto: '',
    ubicacion: '',
    foto: null,
    fotoPreview: ''
  });

  const mapRef = useRef(null);

  // ── Google Maps ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google || !window.google.maps) {
        window.initMap = initMap;
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) existingScript.remove();
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        script.onerror = () => { console.error('Error al cargar el script de Google Maps'); };
      } else {
        initMap();
      }
    };
    if (activeStep === 2) {
      setTimeout(loadGoogleMapsScript, 500);
    }
    return () => { delete window.initMap; };
  }, [activeStep]);

  const initMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) return;
    try {
      const defaultLocation = { lat: 19.4326, lng: -99.1332 };
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        styles: [
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9f7fa' }, { lightness: 17 }] },
          { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 20 }] },
          { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }, { lightness: 17 }] },
          { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }] },
          { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 18 }] },
          { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 16 }] },
          { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 21 }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dedede' }, { lightness: 21 }] }
        ]
      });
      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#06B6D4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 10
        }
      });
      const geocoder = new window.google.maps.Geocoder();
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };
          map.setCenter(userLocation);
          marker.setPosition(userLocation);
          geocoder.geocode({ location: userLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              let city = '', country = '';
              results[0].address_components.forEach(component => {
                if (component.types.includes('locality')) city = component.long_name;
                if (component.types.includes('country')) country = component.long_name;
              });
              setFormData((prev) => ({ ...prev, ubicacion: `${city}, ${country}` }));
            }
          });
        },
        (error) => {
          console.log('Error obteniendo la ubicación:', error.message);
          geocoder.geocode({ location: defaultLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              let city = '', country = '';
              results[0].address_components.forEach(component => {
                if (component.types.includes('locality')) city = component.long_name;
                if (component.types.includes('country')) country = component.long_name;
              });
              setFormData((prev) => ({ ...prev, ubicacion: `${city}, ${country}` }));
            }
          });
        },
        { timeout: 10000 }
      );
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            let city = '', country = '';
            results[0].address_components.forEach(component => {
              if (component.types.includes('locality')) city = component.long_name;
              if (component.types.includes('country')) country = component.long_name;
            });
            setFormData((prev) => ({ ...prev, ubicacion: `${city}, ${country}` }));
          }
        });
      });
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  };

  // ── Dropzone ────────────────────────────────────────────────────────
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        alert('Por favor, sube una imagen válida.');
        return;
      }
      const rawFile = acceptedFiles[0];
      setSubiendo(true);
      setEstadoSubida('Optimizando imagen...');
      try {
        const compressedFile = await compressImage(rawFile, 1200, 0.8);
        setFormData(prev => ({
          ...prev,
          foto: compressedFile,
          fotoPreview: URL.createObjectURL(compressedFile)
        }));
      } catch (err) {
        console.error('Error al comprimir la imagen:', err);
        setFormData(prev => ({
          ...prev,
          foto: rawFile,
          fotoPreview: URL.createObjectURL(rawFile)
        }));
      } finally {
        setSubiendo(false);
        setEstadoSubida('');
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectOption = (option) => {
    const qKey = PREGUNTAS[currentQ].id;
    setQaData(prev => ({ ...prev, [qKey]: option }));
  };

  const handleNextQ = () => {
    if (currentQ < PREGUNTAS.length - 1) setCurrentQ(prev => prev + 1);
  };

  const handleBackQ = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1);
  };

  // ── Diagnóstico IA ──────────────────────────────────────────────────
  const handleCalcularSalud = async () => {
    setLoadingIA(true);
    try {
      const payload = {
        respuestas: {
          enciende: qaData.enciende,
          estadoFisico: qaData.estadoFisico,
          bateria: qaData.bateria,
          antiguedad: qaData.antiguedad
        },
        dispositivo: qaData.dispositivo
      };

      const res = await axios.post(`${backendUrl}/api/diagnostico-ia`, payload);
      const resultPayload = res.data?.data || res.data?.resultado || res.data;
      setDiagnosticoResult(resultPayload);

      const catMap = {
        'laptop': 'Computadoras y Accesorios',
        'desktop': 'Computadoras y Accesorios',
        'computadoras y accesorios': 'Computadoras y Accesorios',
        'smartphone': 'Teléfonos y Accesorios',
        'smartphones': 'Teléfonos y Accesorios',
        'teléfonos y accesorios': 'Teléfonos y Accesorios',
        'tablet': 'Tablets y Accesorios',
        'tablets': 'Tablets y Accesorios',
        'tablets y accesorios': 'Tablets y Accesorios',
        'smartwatch': 'Otros',
        'otros': 'Otros'
      };
      const selectedDevice = qaData.dispositivo || '';
      const keyLower = selectedDevice.trim().toLowerCase();
      const catCalculada = catMap[keyLower] || 'Otros';

      setFormData(prev => ({
        ...prev,
        nombredeldispositivo: selectedDevice,
        estado: resultPayload?.estado,
        titulo: `${selectedDevice} para reutilizar`,
        categoria: catCalculada,
        descripcion: resultPayload?.analisis || resultPayload?.diagnostico || ''
      }));

      setActiveStep(1);
    } catch (err) {
      console.error(err);
      alert('Error en el servicio de diagnóstico: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingIA(false);
    }
  };

  // ── Submit final ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (subiendo) return;

    const usuario = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    if (!usuario || !usuario.id) {
      alert('Debes iniciar sesión para publicar');
      return;
    }

    const camposRequeridos = ['titulo', 'nombredeldispositivo', 'categoria', 'estado', 'descripcion', 'contacto'];
    const camposFaltantes = camposRequeridos.filter(campo => !formData[campo]);
    if (camposFaltantes.length > 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!formData.foto) {
      alert('Por favor sube una foto del dispositivo');
      return;
    }

    setSubiendo(true);
    setEstadoSubida('Subiendo imagen y publicando dispositivo...');

    try {
      // Garantizar compresión previa al envío (ancho max 1200px, calidad 0.8)
      const fotoFinal = (formData.foto instanceof File)
        ? await compressImage(formData.foto, 1200, 0.8)
        : formData.foto;

      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'foto') {
          form.append('foto', fotoFinal);
        } else if (key !== 'fotoPreview') {
          form.append(key, formData[key]);
        }
      });
      form.append('autor_id', usuario.id);
      if (diagnosticoResult?.verificacion_id) {
        form.append('verificacion_id', diagnosticoResult.verificacion_id);
      }

      await axios.post(`${backendUrl}/api/publicaciones`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 45000, // Timeout de 45 segundos para prevenir Network Error en conexiones móviles lentas
      });

      alert('¡Dispositivo publicado con éxito en el catálogo!');
      
      setFormData({
        titulo: '', nombredeldispositivo: '', marcaoModelo: '',
        categoria: '', estado: '', descripcion: '',
        contacto: '', ubicacion: '', foto: null, fotoPreview: ''
      });
      setQaData({ dispositivo: '', enciende: '', estadoFisico: '', bateria: '', antiguedad: '' });
      setCurrentQ(0);
      setDiagnosticoResult(null);
      setActiveStep(0);
    } catch (error) {
      console.error('Error al publicar:', error);
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');
      const mensajeError = isTimeout
        ? 'La conexión tardó demasiado. Por favor verifica tu red e intenta de nuevo.'
        : (error.response?.data?.message || error.message);
      alert('Error al publicar: ' + mensajeError);
    } finally {
      setSubiendo(false);
      setEstadoSubida('');
    }
  };

  const qItem = PREGUNTAS[currentQ];
  const isQAValueSelected = !!qaData[qItem.id];
  const isQAFinished = Object.values(qaData).every(v => v !== '');
  const isPublishFormReady = formData.titulo && formData.categoria && formData.foto && formData.contacto && formData.ubicacion;

  // ── Cuestionario ────────────────────────────────────────────────────
  const renderCuestionario = () => {
    const ActiveIcon = qItem.IconComponent;
    
    return (
      <motion.div key="step-qa" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
        <div className="fml-glass" style={{ padding: '2.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
            <span style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Paso Técnico {currentQ + 1} de {PREGUNTAS.length}
            </span>
            <span style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--primary)' }}>
              {Math.round(((currentQ + 1) / PREGUNTAS.length) * 100)}% Completado
            </span>
          </div>
          <div className="fml-bar" style={{ marginBottom: '2.5rem' }}>
            <div className="fml-bar-fill" style={{ width: `${((currentQ + 1) / PREGUNTAS.length) * 100}%` }} />
          </div>

          {loadingIA ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 0', gap: '1.25rem' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-mid)', letterSpacing: '-0.01em' }}>
                Procesando auditoría técnica de hardware...
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', marginBottom: '1.25rem' }}>
                  {ActiveIcon && <ActiveIcon size={28} color="var(--primary)" />}
                </div>
                <h2 style={{ fontWeight: 800, color: 'var(--brand-dark)', fontSize: '1.25rem', margin: 0, letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.35 }}>
                  {qItem.q}
                </h2>
              </div>

              <div className={qItem.id === 'dispositivo' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10" : "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"}>
                {qItem.options.map(opt => {
                  const isSelected = qaData[qItem.id] === opt;
                  return (
                    <div
                      key={opt}
                      className={`fml-q-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectOption(opt)}
                    >
                      <span style={{ fontWeight: 700, fontSize: '.9rem', letterSpacing: '-0.01em' }}>{opt}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="fml-btn-outline" 
                  onClick={handleBackQ} 
                  disabled={currentQ === 0}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ArrowLeft size={16} /> Atrás
                </button>

                {currentQ < PREGUNTAS.length - 1 ? (
                  <button 
                    className="fml-btn-primary" 
                    onClick={handleNextQ} 
                    disabled={!isQAValueSelected}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    Siguiente <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="fml-btn-primary"
                    onClick={handleCalcularSalud}
                    disabled={!isQAFinished}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    Procesar Diagnóstico <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </motion.div>
    );
  };

  // ── Resultado IA ────────────────────────────────────────────────────
  const renderResultadoIA = () => {
    if (!diagnosticoResult) return null;
    const certTheme = diagnosticoResult.estado === 'Buen estado' ? 'green' : (diagnosticoResult.estado === 'Usado' ? 'amber' : 'brand');
    const colorCode = diagnosticoResult.color || '#06B6D4';

    return (
      <motion.div key="step-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
        <div className="fml-glass" style={{ padding: '2.25rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className={`fml-chip fml-chip-${certTheme}`} style={{ fontSize: '.65rem', padding: '.3rem 1rem', marginBottom: '.6rem' }}>
              Auditoría IA Completada
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-dark)', margin: '0 0 .4rem', letterSpacing: '-0.02em' }}>
              Informe de Evaluación Técnica
            </h2>
            <p style={{ color: 'var(--muted-text)', fontWeight: 600, fontSize: '.84rem', margin: 0 }}>
              El hardware del dispositivo ha sido analizado para asegurar la inmutabilidad de los datos técnicos.
            </p>
          </div>

          <div className="fml-divider" />

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start mb-6">

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="fml-cert-seal" style={{ padding: '.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--seal-border)', background: 'var(--seal-icon-bg)', display: 'grid', placeItems: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', color: 'var(--primary)' }}>
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ margin: 0, fontWeight: 800, color: 'var(--brand-dark)', fontSize: '.98rem' }}>
                    Sello de Verificación
                  </div>
                  <div style={{ marginTop: '.2rem', color: 'var(--text-mid)', fontSize: '.82rem', fontWeight: 600 }}>
                    Estado homologado: <strong style={{ color: 'var(--primary)' }}>{diagnosticoResult.estado}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: `3px solid ${colorCode}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  background: 'var(--bg-clean)'
                }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-dark)', letterSpacing: '-0.02em' }}>
                    {diagnosticoResult?.puntuacion ?? diagnosticoResult?.score ?? 0}
                  </span>
                  <span style={{ fontSize: '.62rem', fontWeight: 800, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Puntos
                  </span>
                </div>
                <div style={{ marginTop: '0.6rem', fontWeight: 800, color: 'var(--primary)', fontSize: '.84rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {diagnosticoResult.estado}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, color: 'var(--brand-dark)', fontSize: '1rem', marginBottom: '.4rem' }}>
                Diagnóstico de Hardware
              </div>
              <p style={{ color: 'var(--text-mid)', fontSize: '.86rem', lineHeight: 1.6, margin: '0 0 1rem', fontWeight: 500 }}>
                {diagnosticoResult?.analisis || diagnosticoResult?.diagnostico || 'Sin análisis de hardware disponible'}
              </p>

              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--primary-light)', padding: '.45rem .9rem', borderRadius: '.5rem', fontSize: '.74rem', fontWeight: 750, color: 'var(--primary-dark)' }}>
                  Impacto: {diagnosticoResult?.impacto_ambiental ?? diagnosticoResult?.impacto ?? 'No calculado'}
                </div>
                <div style={{ background: 'var(--primary-light)', padding: '.45rem .9rem', borderRadius: '.5rem', fontSize: '.74rem', fontWeight: 750, color: 'var(--primary-dark)' }}>
                  Confianza: {diagnosticoResult?.confianza ?? 0}%
                </div>
              </div>

              <div style={{ background: 'var(--bg-clean)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '.8rem', display: 'block', marginBottom: '.2rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Recomendación de Reacondicionamiento
                </span>
                <span style={{ fontSize: '.82rem', color: 'var(--text-mid)', fontWeight: 600 }}>
                  {diagnosticoResult?.recomendacion_pro || diagnosticoResult?.recomendacion || 'Sin recomendación disponible'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button 
                  className="fml-btn-outline" 
                  onClick={() => { setActiveStep(0); setCurrentQ(0); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RotateCcw size={16} /> Re-evaluar
                </button>
                <button 
                  className="fml-btn-primary" 
                  onClick={() => {
                    if (diagnosticoResult) {
                      const tipoDispositivo = diagnosticoResult.tipo || qaData.dispositivo || formData.nombredeldispositivo || 'Dispositivo';
                      const estadoHomologado = diagnosticoResult.estado || formData.estado || '';
                      const sufijoTitulo = estadoHomologado === 'Reciclaje' ? 'para reciclaje' : 'para reutilizar';

                      setFormData(prev => ({
                        ...prev,
                        estado: estadoHomologado,
                        titulo: `${tipoDispositivo} ${sufijoTitulo}`,
                        puntuacion: diagnosticoResult.puntuacion ?? diagnosticoResult.score ?? prev.puntuacion ?? null,
                        descripcion: diagnosticoResult.analisis ?? diagnosticoResult.diagnostico ?? prev.descripcion,
                        verificacion_id: diagnosticoResult.verificacion_id ?? prev.verificacion_id
                      }));
                    }
                    setActiveStep(2);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  Continuar a la Publicación <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    );
  };

  // ── Form Publicación ────────────────────────────────────────────────
  const renderFormPublicacion = () => {
    return (
      <motion.div key="step-form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
        
        <div className="fml-cert-seal" style={{ marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', border: '1px solid var(--seal-border)', background: 'var(--seal-icon-bg)', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', color: 'var(--primary)' }}>
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ margin: 0, fontWeight: 800, color: 'var(--brand-dark)', fontSize: '1rem', letterSpacing: '-0.02em' }}>
              Sello de Verificación Certificado
            </div>
            <p style={{ margin: '.35rem 0 0', fontSize: '.88rem', color: 'var(--text-mid)', fontWeight: 600, lineHeight: 1.6, maxWidth: '700px' }}>
              Publicación respaldada por auditoría técnica. Estado homologado: <strong style={{ color: 'var(--primary)' }}>{formData.estado || 'Pendiente'}</strong>. Registro inmutable disponible para seguimiento y control.
            </p>
          </div>
        </div>

        <div className="fml-glass" style={{ padding: '2rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--brand-dark)', fontSize: '1.15rem', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
            Datos del Registro de Publicación
          </div>
          <div className="fml-divider" style={{ marginTop: 0 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            <div className="fml-grid2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Título de la publicación">
                <input className="fml-input" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. Laptop HP EliteBook para donar" required />
              </Field>

              <Field label="Dispositivo Evaluado (Inmutable)">
                <input className="fml-input" name="nombredeldispositivo" value={formData.nombredeldispositivo} disabled style={{ background: '#F0F9FF', color: '#64748B', fontWeight: 700, border: '1px solid var(--border)', cursor: 'not-allowed' }} />
              </Field>

              <Field label="Marca o Modelo">
                <input className="fml-input" name="marcaoModelo" value={formData.marcaoModelo} onChange={handleChange} placeholder="Ej. HP EliteBook 840, Samsung Galaxy S20" />
              </Field>

              <Field label="Categoría del Catálogo">
                <select className="fml-select" name="categoria" value={formData.categoria} onChange={handleChange} required>
                  <option value="">Selecciona una categoría…</option>
                  <option value="Teléfonos y Accesorios">Teléfonos y Accesorios</option>
                  <option value="Computadoras y Accesorios">Computadoras y Accesorios</option>
                  <option value="Tablets y Accesorios">Tablets y Accesorios</option>
                  <option value="Otros">Otros</option>
                </select>
              </Field>

              <Field label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Estado Registrado <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#06B6D4', display: 'inline-block' }} /></span>}>
                <input className="fml-input" name="estado" value={formData.estado} disabled style={{ background: 'var(--bg-clean)', color: 'var(--brand-dark)', fontWeight: 700, border: '1px solid var(--seal-border)', cursor: 'not-allowed' }} />
              </Field>
            </div>

            <Field label="Descripción Detallada del Equipo">
              <textarea className="fml-textarea" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Indique los componentes funcionales, accesorios incluidos o detalles relevantes..." required />
            </Field>

            <div className="fml-divider" />

            <Field label="Fotografía Real del Hardware (Requerido)">
              <div className="fml-drop" {...getRootProps()}>
                <input {...getInputProps()} />
                <div style={{ color: 'var(--primary)', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <Upload size={24} />
                </div>
                <div style={{ fontWeight: 700, color: 'var(--brand-dark)', fontSize: '.9rem', marginBottom: '.15rem', letterSpacing: '-0.01em' }}>
                  Cargar foto del dispositivo
                </div>
                <div style={{ color: '#94A3B8', fontWeight: 600, fontSize: '.78rem' }}>
                  Arrastre una imagen o haga clic para seleccionar archivo
                </div>
              </div>
            </Field>

            {formData.fotoPreview && (
              <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border)', marginTop: '.5rem' }}>
                <img src={formData.fotoPreview} alt="Previsualización" style={{ width: '100%', height: '200px', objectFit: 'contain', background: 'var(--bg-clean)' }} />
              </div>
            )}

            <div className="fml-divider" />

            <div style={{ fontWeight: 800, color: 'var(--brand-dark)', fontSize: '1rem', marginBottom: '.5rem', letterSpacing: '-0.01em' }}>
              Ubicación y Datos de Contacto
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '.78rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '.75rem' }}>
              <MapPin size={14} /> Arrastre el marcador a la dirección o punto de entrega acordado.
            </div>
            
            <div ref={mapRef} style={{ height: 240, borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1rem' }} />

            <Field label="Ubicación de Entrega">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.75rem 1rem', background: 'var(--bg-clean)', border: '1px solid var(--border)', borderRadius: '0.75rem', fontWeight: 700, color: 'var(--brand-dark)', fontSize: '.85rem' }}>
                {formData.ubicacion || 'Cargando ubicación desde el mapa…'}
              </div>
            </Field>

            <Field label="Contacto de Coordinación">
              <input className="fml-input" name="contacto" value={formData.contacto} onChange={handleChange} placeholder="Teléfono, correo electrónico o usuario de mensajería" required />
            </Field>

          </div>

          <div className="fml-divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="fml-btn-outline" onClick={() => setActiveStep(1)} disabled={subiendo} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', opacity: subiendo ? 0.6 : 1 }}>
              <ArrowLeft size={16} /> Ver Auditoría
            </button>
            <button
              className="fml-btn-primary"
              onClick={handleSubmit}
              disabled={!isPublishFormReady || subiendo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: (!isPublishFormReady || subiendo) ? 0.6 : 1,
                cursor: (!isPublishFormReady || subiendo) ? 'not-allowed' : 'pointer'
              }}
            >
              {subiendo ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{estadoSubida || 'Subiendo imagen...'}</span>
                </>
              ) : (
                <>
                  <span>Publicar Dispositivo Certificado</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

        </div>
      </motion.div>
    );
  };

  // ── Render General ──
  return (
    <div className="fml w-full max-w-full overflow-x-hidden px-4 sm:px-6 md:px-8" style={{ minHeight: '100vh', padding: '2rem 1rem 5rem', background: 'linear-gradient(160deg, #F0F9FF 0%, #FFFFFF 60%, #E0F2FE 100%)' }}>
      
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-8%', width: '42%', height: '42%', background: 'rgba(186, 230, 253, 0.35)', borderRadius: '50%', filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-8%', width: '38%', height: '38%', background: 'rgba(186, 230, 253, 0.25)', borderRadius: '50%', filter: 'blur(90px)' }} />
      </div>

      <div style={{ maxWidth: '1020px', margin: '0 auto' }}>
        
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="fml-chip fml-chip-brand" style={{ display: 'inline-flex', marginBottom: '.75rem' }}>
            ✦ Economía Circular
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.25rem)', fontWeight: 800, color: 'var(--brand-dark)', margin: '0 0 .5rem', letterSpacing: '-.03em', lineHeight: 1.15 }}>
            Publica tu <span style={{ color: 'var(--primary)' }}>dispositivo</span>
          </h1>
          <p style={{ color: '#64748B', fontWeight: 600, fontSize: '.9rem', margin: 0 }}>
            Comparte tecnología útil y da una segunda vida a tus equipos electrónicos
          </p>
        </motion.div>

        <div className="fml-layout grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
          
          <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="fml-sidebar" style={{ position: 'sticky', top: '1.5rem' }}>
            <div className="fml-glass" style={{ padding: '1rem' }}>
              <StepSidebar activeStep={activeStep} />
            </div>
          </motion.div>

          <div>
            <AnimatePresence mode="wait">
              {activeStep === 0 && renderCuestionario()}
              {activeStep === 1 && renderResultadoIA()}
              {activeStep === 2 && renderFormPublicacion()}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* OVERLAY DE FEEDBACK VISUAL DE CARGA */}
      <AnimatePresence>
        {subiendo && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4 border border-slate-100"
            >
              <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-500 border border-cyan-100">
                <Loader2 size={36} className="animate-spin text-cyan-500" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg mb-1">Subiendo Dispositivo</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{estadoSubida || 'Optimizando foto y procesando datos...'}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Formulario;