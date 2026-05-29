import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import PublishIcon from '@mui/icons-material/Publish';

// ─── API Key ──────────────────────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = 'AIzaSyDA6ZQGx-Ih-qm7IaIiaPGeKnY7Z4OyRk4';

// ─── Dispositivos DB (idéntica al original) ───────────────────────────
const dispositivosDB = {
  'laptop': {
    categoria: 'Computadoras y Accesorios',
    estado: 'Usado',
    descripcion: 'Computadora portátil en buen estado de funcionamiento.'
  },
  'smartphone': {
    categoria: 'Teléfonos y Accesorios',
    estado: 'Usado',
    descripcion: 'Teléfono inteligente en condiciones de uso.'
  },
  'tablet': {
    categoria: 'Teléfonos y Accesorios',
    estado: 'Usado',
    descripcion: 'Tablet con pantalla táctil funcional.'
  },
  'desktop computer': {
    categoria: 'Computadoras y Accesorios',
    estado: 'Usado',
    descripcion: 'Computadora de escritorio completa.'
  },
  'monitor': {
    categoria: 'Computadoras y Accesorios',
    estado: 'Usado',
    descripcion: 'Monitor en buen estado.'
  },
  'keyboard': {
    categoria: 'Computadoras y Accesorios',
    estado: 'Usado',
    descripcion: 'Teclado funcional.'
  },
  'mouse': {
    categoria: 'Computadoras y Accesorios',
    estado: 'Usado',
    descripcion: 'Mouse en buen estado.'
  },
  'printer': {
    categoria: 'Computadoras y Accesorios',
    estado: 'Usado',
    descripcion: 'Impresora en condiciones de uso.'
  },
  'refrigerator': {
    categoria: 'Electrodomésticos',
    estado: 'Usado',
    descripcion: 'Refrigerador funcional.'
  },
  'microwave': {
    categoria: 'Electrodomésticos',
    estado: 'Usado',
    descripcion: 'Microondas en buen estado.'
  },
  'tv': {
    categoria: 'Electrodomésticos',
    estado: 'Usado',
    descripcion: 'Televisor en buenas condiciones.'
  },
  'headphones': {
    categoria: 'Teléfonos y Accesorios',
    estado: 'Usado',
    descripcion: 'Audífonos funcionales.'
  }
};

// ─── Detección por imagen (idéntica al original) ──────────────────────
const detectarDispositivoPorImagen = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const { width, height } = img;
        const ratio = width / height;
        console.log('Proporción de imagen (ancho/alto):', ratio);
        if (ratio >= 0.4 && ratio <= 0.6) {
          resolve('smartphone');
        } else if (ratio > 0.6 && ratio <= 0.8) {
          resolve('tablet');
        } else if (ratio > 1.2) {
          resolve('laptop');
        } else if (ratio > 0.8 && ratio <= 1.2) {
          resolve('tablet');
        } else {
          resolve('smartphone');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// ─── Detección por nombre (idéntica al original) ──────────────────────
const detectarDispositivoPorNombre = (nombreArchivo) => {
  nombreArchivo = nombreArchivo.toLowerCase();
  const keywordMap = {
    'laptop': 'laptop', 'notebook': 'laptop', 'portatil': 'laptop',
    'phone': 'smartphone', 'movil': 'smartphone', 'celular': 'smartphone',
    'smartphone': 'smartphone', 'iphone': 'smartphone', 'android': 'smartphone',
    'vivo': 'smartphone', 'samsung': 'smartphone', 'xiaomi': 'smartphone', 'huawei': 'smartphone',
    'tablet': 'tablet', 'ipad': 'tablet',
    'desktop': 'desktop computer', 'pc': 'desktop computer',
    'monitor': 'monitor', 'pantalla': 'monitor',
    'teclado': 'keyboard', 'keyboard': 'keyboard',
    'mouse': 'mouse', 'raton': 'mouse',
    'printer': 'printer', 'impresora': 'printer',
    'fridge': 'refrigerator', 'refrigerador': 'refrigerator',
    'microwave': 'microwave', 'microondas': 'microwave',
    'tv': 'tv', 'television': 'tv',
    'headphone': 'headphones', 'auricular': 'headphones'
  };
  for (const [keyword, device] of Object.entries(keywordMap)) {
    if (nombreArchivo.includes(keyword)) return device;
  }
  return null;
};

// ─── Estilos globales ─────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('fml-styles')) return;
  const s = document.createElement('style');
  s.id = 'fml-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    .fml { font-family: 'Plus Jakarta Sans', sans-serif; }
    .fml *, .fml *::before, .fml *::after { box-sizing: border-box; }

    .fml-glass {
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.65);
      border-radius: 2rem;
      box-shadow: 0 24px 64px -12px rgba(0,0,0,0.07), 0 0 0 1px rgba(49,194,219,.06);
    }

    /* Sidebar pills */
    .fml-pill { display:flex; align-items:center; gap:.75rem; padding:.75rem 1rem; border-radius:1.25rem; transition:all .25s; }
    .fml-pill.active { background:#E8F9FC; }
    .fml-pill.active .fml-pill-label { color:#1DA8BF; }
    .fml-pill.done   .fml-pill-label { color:#22C55E; }
    .fml-pill.idle   .fml-pill-label { color:#94A3B8; }
    .fml-pill-num {
      width:2rem; height:2rem; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-weight:800; font-size:.78rem; flex-shrink:0; transition:all .25s;
    }
    .fml-pill-num.active { background:#31C2DB; color:#fff; box-shadow:0 4px 14px rgba(49,194,219,.4); }
    .fml-pill-num.done   { background:#22C55E; color:#fff; }
    .fml-pill-num.idle   { background:#F1F5F9; color:#94A3B8; }
    .fml-pill-label { font-weight:800; font-size:.88rem; line-height:1.2; }
    .fml-pill-sub   { font-size:.7rem; font-weight:600; color:#94A3B8; margin-top:.1rem; }

    /* Inputs */
    .fml-field { display:flex; flex-direction:column; gap:.4rem; }
    .fml-label { font-size:.68rem; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:.07em; }
    .fml-input, .fml-select, .fml-textarea {
      width:100%; padding:.9rem 1.1rem;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:600; font-size:.92rem; color:#0F172A;
      background:#F8FAFC; border:2px solid transparent; border-radius:1.1rem;
      outline:none; transition:all .2s; appearance:none;
    }
    .fml-input:focus, .fml-select:focus, .fml-textarea:focus {
      border-color:#31C2DB; background:#fff; box-shadow:0 0 0 4px rgba(49,194,219,.1);
    }
    .fml-input::placeholder, .fml-textarea::placeholder { color:#CBD5E1; font-weight:500; }
    .fml-textarea { resize:vertical; min-height:110px; }

    /* Drop zone */
    .fml-drop {
      border:2.5px dashed #CBD5E1; border-radius:1.75rem;
      padding:2.5rem 2rem; text-align:center; cursor:pointer;
      transition:all .25s; background:#F8FAFC;
    }
    .fml-drop:hover { border-color:#31C2DB; background:#E8F9FC; }

    /* Buttons */
    .fml-btn-primary {
      background:#0F172A; color:#fff; padding:.95rem 2rem;
      border-radius:1.1rem; border:none; cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:.95rem;
      display:inline-flex; align-items:center; gap:.6rem;
      transition:all .22s; box-shadow:0 8px 24px rgba(15,23,42,.15);
    }
    .fml-btn-primary:hover:not(:disabled) { background:#31C2DB; transform:translateY(-2px); box-shadow:0 12px 28px rgba(49,194,219,.3); }
    .fml-btn-primary:disabled { opacity:.35; cursor:not-allowed; }
    .fml-btn-outline {
      background:transparent; color:#31C2DB; padding:.95rem 1.75rem;
      border-radius:1.1rem; border:2px solid #31C2DB; cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:.95rem;
      display:inline-flex; align-items:center; gap:.5rem; transition:all .22s;
    }
    .fml-btn-outline:hover:not(:disabled) { background:#E8F9FC; }
    .fml-btn-outline:disabled { opacity:.3; cursor:not-allowed; }

    /* Progress */
    .fml-bar { height:6px; border-radius:99px; background:#E2E8F0; overflow:hidden; }
    .fml-bar-fill { height:100%; background:linear-gradient(90deg,#31C2DB,#1DA8BF); border-radius:99px; transition:width .3s; }

    /* Toggle */
    .fml-toggle {
      width:50px; height:26px; border-radius:99px; border:none; cursor:pointer;
      position:relative; transition:background .25s; flex-shrink:0;
    }
    .fml-toggle::after {
      content:''; position:absolute; top:3px; left:3px;
      width:20px; height:20px; border-radius:50%; background:#fff;
      transition:transform .25s; box-shadow:0 2px 6px rgba(0,0,0,.2);
    }
    .fml-toggle.on  { background:#31C2DB; }
    .fml-toggle.on::after  { transform:translateX(24px); }
    .fml-toggle.off { background:#CBD5E1; }

    /* Chips */
    .fml-chip {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.28rem .8rem; border-radius:99px;
      font-size:.7rem; font-weight:800;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    .fml-chip-brand { background:#E8F9FC; color:#1DA8BF; }
    .fml-chip-green { background:#DCFCE7; color:#16A34A; }
    .fml-chip-amber { background:#FEF9C3; color:#B45309; }

    /* Summary rows */
    .fml-row { display:flex; flex-direction:column; gap:.25rem; padding:.85rem 0; border-bottom:1px solid #F1F5F9; }
    .fml-row:last-child { border-bottom:none; }
    .fml-row-label { font-size:.68rem; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:.07em; }
    .fml-row-val   { font-size:.92rem; font-weight:700; color:#0F172A; }

    /* Correction btn */
    .fml-btn-fix {
      background:#fff; border:1.5px solid #31C2DB; color:#31C2DB;
      padding:.35rem .9rem; border-radius:.8rem;
      font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:.78rem; cursor:pointer;
    }
    .fml-btn-fix:hover { background:#E8F9FC; }

    /* Section divider */
    .fml-divider { height:1px; background:#F1F5F9; margin:1.5rem 0; }

    /* Responsive */
    @media(max-width:680px){
      .fml-sidebar { display:none; }
      .fml-layout  { grid-template-columns:1fr !important; }
      .fml-grid2   { grid-template-columns:1fr !important; }
    }
  `;
  document.head.appendChild(s);
};

// ─── Sidebar component ────────────────────────────────────────────────
const STEPS_META = [
  { label: 'Sube una foto',        sub: 'Reconocimiento automático' },
  { label: 'Información',          sub: 'Detalles del dispositivo' },
  { label: 'Ubicación y contacto', sub: 'Dónde está y cómo contactar' },
  { label: 'Publicar',             sub: 'Revisión y envío' },
];

const StepSidebar = ({ activeStep }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
    {STEPS_META.map((s, i) => {
      const st = i < activeStep ? 'done' : i === activeStep ? 'active' : 'idle';
      return (
        <div key={i} className={`fml-pill ${st}`}>
          <div className={`fml-pill-num ${st}`}>{st === 'done' ? '✓' : i + 1}</div>
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

// ─── Componente principal ─────────────────────────────────────────────
const Formulario = () => {
  useEffect(() => { injectStyles(); }, []);

  const [activeStep, setActiveStep] = useState(0);
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
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [lastDetectedDevice, setLastDetectedDevice] = useState('');
  const [reconocimientoActivo, setReconocimientoActivo] = useState(true);
  const [progress, setProgress] = useState(0);
  const mapRef = useRef(null);

  // ── Progreso de reconocimiento (idéntico al original) ───────────────
  useEffect(() => {
    let interval;
    if (isRecognizing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 12;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 300);
    } else {
      setProgress(0);
    }
    return () => { clearInterval(interval); };
  }, [isRecognizing]);

  // ── Google Maps (idéntico al original) ──────────────────────────────
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
    if (!window.google || !window.google.maps || !mapRef.current) {
      console.log('Google Maps no está disponible o el contenedor del mapa no existe');
      return;
    }
    try {
      const defaultLocation = { lat: 19.4326, lng: -99.1332 };
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        styles: [
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }, { lightness: 17 }] },
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
          fillColor: '#31C2DB',
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

  // ── Dropzone (idéntico al original) ─────────────────────────────────
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        alert('Por favor, sube una imagen válida.');
        return;
      }
      const file = acceptedFiles[0];
      console.log('Archivo aceptado:', file.name);
      setFormData(prev => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file)
      }));
      if (reconocimientoActivo) {
        setIsRecognizing(true);
        try {
          let dispositivo = await detectarDispositivoPorImagen(file);
          console.log('Dispositivo detectado por imagen:', dispositivo);
          if (!dispositivo) {
            const dispositivoPorNombre = detectarDispositivoPorNombre(file.name);
            if (dispositivoPorNombre) {
              dispositivo = dispositivoPorNombre;
              console.log('Dispositivo detectado por nombre:', dispositivo);
            }
          }
          setLastDetectedDevice(dispositivo);
          const info = dispositivosDB[dispositivo];
          setFormData(prev => ({
            ...prev,
            titulo: `${dispositivo.charAt(0).toUpperCase() + dispositivo.slice(1)} para reutilizar`,
            nombredeldispositivo: dispositivo,
            categoria: info.categoria,
            estado: info.estado,
            descripcion: info.descripcion
          }));
        } catch (error) {
          console.error('Error en reconocimiento:', error);
          const dispositivoPorNombre = detectarDispositivoPorNombre(file.name);
          const dispositivo = dispositivoPorNombre || 'smartphone';
          const info = dispositivosDB[dispositivo];
          setLastDetectedDevice(dispositivo);
          setFormData(prev => ({
            ...prev,
            titulo: `${dispositivo.charAt(0).toUpperCase() + dispositivo.slice(1)} para reutilizar`,
            nombredeldispositivo: dispositivo,
            categoria: info.categoria,
            estado: info.estado,
            descripcion: info.descripcion
          }));
        } finally {
          setTimeout(() => { setIsRecognizing(false); }, 1000);
        }
      }
    }
  });

  // ── handleChange (idéntico al original) ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ── handleSubmit (idéntico al original) ─────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'fotoPreview') form.append(key, formData[key]);
    });
    form.append('autor_id', usuario.id);
    try {
      const loadingIndicator = document.createElement('div');
      loadingIndicator.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;';
      loadingIndicator.innerHTML = '<div style="background:white;padding:20px;border-radius:10px;"><h3>Publicando...</h3></div>';
      document.body.appendChild(loadingIndicator);
      await axios.post('http://localhost:5000/api/publicaciones', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      document.body.removeChild(loadingIndicator);
      alert('Publicación realizada con éxito');
      setFormData({
        titulo: '', nombredeldispositivo: '', marcaoModelo: '',
        categoria: '', estado: '', descripcion: '',
        contacto: '', ubicacion: '', foto: null, fotoPreview: ''
      });
      setActiveStep(0);
    } catch (error) {
      console.error('Error al publicar:', error);
      alert('Error al publicar: ' + (error.response?.data?.message || error.message));
    }
  };

  // ── toggleReconocimiento (idéntico al original) ──────────────────────
  const toggleReconocimiento = () => {
    setReconocimientoActivo(!reconocimientoActivo);
  };

  // ── corregirDispositivo (idéntico al original) ───────────────────────
  const corregirDispositivo = () => {
    const opciones = Object.keys(dispositivosDB).map(key =>
      key.charAt(0).toUpperCase() + key.slice(1)
    ).join(', ');
    const userDevice = prompt(`¿Qué dispositivo es realmente? Opciones: ${opciones}`, lastDetectedDevice);
    if (userDevice) {
      const deviceKey = userDevice.toLowerCase();
      if (dispositivosDB[deviceKey]) {
        setLastDetectedDevice(deviceKey);
        const info = dispositivosDB[deviceKey];
        setFormData(prev => ({
          ...prev,
          titulo: `${deviceKey.charAt(0).toUpperCase() + deviceKey.slice(1)} para reutilizar`,
          nombredeldispositivo: deviceKey,
          categoria: info.categoria,
          estado: info.estado,
          descripcion: info.descripcion
        }));
      } else {
        alert('Dispositivo no reconocido en nuestra base de datos. Por favor selecciona uno de los dispositivos disponibles.');
      }
    }
  };

  // ── Navegación (idéntica al original) ───────────────────────────────
  const handleNext = () => { setActiveStep((prev) => prev + 1); };
  const handleBack = () => { setActiveStep((prev) => prev - 1); };

  // ── Validaciones (idénticas al original) ────────────────────────────
  const isPaso1Completo = formData.foto && formData.nombredeldispositivo;
  const isPaso2Completo = formData.titulo && formData.categoria && formData.estado && formData.descripcion;
  const isPaso3Completo = formData.contacto && formData.ubicacion;

  // ── Chip estado ──────────────────────────────────────────────────────
  const chipClass = (estado) => {
    if (['Nuevo', 'Como nuevo'].includes(estado)) return 'fml-chip fml-chip-green';
    if (['Dañado', 'Irreparable', 'Desuso'].includes(estado)) return 'fml-chip fml-chip-amber';
    return 'fml-chip fml-chip-brand';
  };

  // ── Step panels ──────────────────────────────────────────────────────
  const stepPanels = [

    // PASO 0 — Foto
    <motion.div key="step0" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
      <div className="fml-glass" style={{ padding: '2rem' }}>

        {/* Toggle reconocimiento */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
              Reconocimiento automático de dispositivos
            </div>
            <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#94A3B8', marginTop: '.15rem' }}>
              El sistema detecta el tipo de dispositivo desde tu foto
            </div>
          </div>
          <button
            className={`fml-toggle ${reconocimientoActivo ? 'on' : 'off'}`}
            onClick={toggleReconocimiento}
          />
        </div>

        {/* Drop zone */}
        <motion.div whileHover={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 300 }}>
          <div className="fml-drop" {...getRootProps()}>
            <input {...getInputProps()} />
            <div style={{ fontSize: '2.8rem', marginBottom: '.75rem' }}>📷</div>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', marginBottom: '.3rem' }}>
              Sube una foto del dispositivo
            </div>
            <div style={{ color: '#94A3B8', fontWeight: 600, fontSize: '.85rem' }}>
              Arrastra una imagen o haz clic para seleccionar
            </div>
            {reconocimientoActivo && (
              <div className="fml-chip fml-chip-brand" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                ✦ Reconocimiento automático activado
              </div>
            )}
          </div>
        </motion.div>

        {/* Barra de progreso de reconocimiento */}
        {isRecognizing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
              <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#31C2DB' }}>Analizando imagen...</span>
              <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#94A3B8' }}>{Math.round(progress)}%</span>
            </div>
            <div className="fml-bar">
              <div className="fml-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </motion.div>
        )}

        {/* Preview de la foto */}
        {formData.fotoPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ marginTop: '1.5rem', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #E2E8F0' }}
          >
            <img
              src={formData.fotoPreview}
              alt="Previsualización"
              style={{ width: '100%', height: '300px', objectFit: 'contain', background: '#F1F5F9', display: 'block' }}
            />
            {lastDetectedDevice && (
              <div style={{ padding: '.9rem 1.25rem', background: '#E8F9FC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#1DA8BF', fontSize: '.88rem' }}>
                  ✅ Dispositivo detectado: <em>{lastDetectedDevice}</em>
                </span>
                <button className="fml-btn-fix" onClick={corregirDispositivo}>✏ Corregir</button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>,

    // PASO 1 — Información del dispositivo
    <motion.div key="step1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
      <div className="fml-glass" style={{ padding: '2rem' }}>
        <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          Detalles del dispositivo
        </div>
        <div className="fml-divider" style={{ marginTop: 0 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="fml-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
            <Field label="Título de la publicación">
              <input
                className="fml-input"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej. Laptop HP para reutilizar"
                required
              />
            </Field>
            <Field label="Nombre del dispositivo">
              <input
                className="fml-input"
                name="nombredeldispositivo"
                value={formData.nombredeldispositivo}
                onChange={handleChange}
                placeholder="Ej. laptop"
                required
              />
            </Field>
            <Field label="Marca o Modelo">
              <input
                className="fml-input"
                name="marcaoModelo"
                value={formData.marcaoModelo}
                onChange={handleChange}
                placeholder="Ej. HP Pavilion, iPhone 12, Samsung Galaxy"
              />
            </Field>
            <Field label="Categoría">
              <select className="fml-select" name="categoria" value={formData.categoria} onChange={handleChange} required>
                <option value="">Selecciona una categoría…</option>
                <option value="Computadoras y Accesorios">Computadoras y Accesorios</option>
                <option value="Teléfonos y Accesorios">Teléfonos y Accesorios</option>
                <option value="Electrodomésticos">Electrodomésticos</option>
              </select>
            </Field>
            <Field label="Estado">
              <select className="fml-select" name="estado" value={formData.estado} onChange={handleChange} required>
                <option value="">Selecciona el estado…</option>
                {['Nuevo', 'Como nuevo', 'Buen estado', 'Usado', 'Dañado', 'Desuso', 'Irreparable'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Descripción">
            <textarea
              className="fml-textarea"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe las características, estado y cualquier información relevante del dispositivo"
              required
            />
          </Field>
        </div>
      </div>
    </motion.div>,

    // PASO 2 — Ubicación y contacto
    <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
      <div className="fml-glass" style={{ padding: '2rem' }}>
        <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.2rem', marginBottom: '.4rem' }}>
          Ubicación del dispositivo
        </div>
        <div className="fml-divider" />
        <div style={{ fontSize: '.82rem', color: '#94A3B8', fontWeight: 600, marginBottom: '1.25rem' }}>
          Arrastra el marcador a la ubicación exacta donde se encuentra el dispositivo o donde prefieres hacer la entrega.
        </div>

        {/* Mapa */}
        <div
          ref={mapRef}
          style={{ height: 300, borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}
        />

        {/* Ubicación detectada */}
        <Field label="Ubicación detectada por el mapa">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.9rem 1.1rem', background: '#F8FAFC', borderRadius: '1.1rem', fontWeight: 700, color: '#334155', fontSize: '.9rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📍</span>
            {formData.ubicacion || 'Cargando ubicación…'}
          </div>
        </Field>

        <div className="fml-divider" />

        <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.05rem', marginBottom: '1rem' }}>
          Información de contacto
        </div>
        <Field label="Contacto">
          <input
            className="fml-input"
            name="contacto"
            value={formData.contacto}
            onChange={handleChange}
            placeholder="Email, teléfono o forma de contacto"
            required
          />
        </Field>
      </div>
    </motion.div>,

    // PASO 3 — Publicar / Resumen
    <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
      <div className="fml-glass" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.35rem' }}>Resumen de la publicación</div>
          <div style={{ fontSize: '.82rem', color: '#94A3B8', fontWeight: 600, marginTop: '.3rem' }}>
            Verifica que todos los datos sean correctos antes de publicar.
          </div>
        </div>
        <div className="fml-divider" style={{ marginTop: 0 }} />

        <div className="fml-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>

          {/* Tarjeta foto */}
          <div style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <img
              src={formData.fotoPreview}
              alt="Previsualización"
              style={{ width: '100%', height: 200, objectFit: 'contain', background: '#F1F5F9', display: 'block' }}
            />
            <div style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '.92rem', marginBottom: '.35rem' }}>
                {formData.titulo}
              </div>
              <div style={{ fontSize: '.78rem', color: '#94A3B8', fontWeight: 600, lineHeight: 1.55 }}>
                {formData.descripcion?.length > 100
                  ? formData.descripcion.substring(0, 100) + '...'
                  : formData.descripcion}
              </div>
            </div>
          </div>

          {/* Detalle */}
          <div>
            <div className="fml-row">
              <span className="fml-row-label">Dispositivo</span>
              <span className="fml-row-val">
                {formData.nombredeldispositivo}
                {formData.marcaoModelo && ` — ${formData.marcaoModelo}`}
              </span>
            </div>
            <div className="fml-row">
              <span className="fml-row-label">Categoría</span>
              <span className="fml-row-val">{formData.categoria}</span>
            </div>
            <div className="fml-row">
              <span className="fml-row-label">Estado</span>
              <span className={chipClass(formData.estado)}>{formData.estado}</span>
            </div>
            <div className="fml-row">
              <span className="fml-row-label">Ubicación</span>
              <span className="fml-row-val">📍 {formData.ubicacion}</span>
            </div>
            <div className="fml-row">
              <span className="fml-row-label">Contacto</span>
              <span className="fml-row-val">{formData.contacto}</span>
            </div>
          </div>
        </div>

        <div className="fml-divider" />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="fml-btn-primary" onClick={handleSubmit} style={{ padding: '1.1rem 3rem', fontSize: '1rem' }}>
            <PublishIcon style={{ fontSize: '1.15rem' }} />
            Publicar dispositivo
          </button>
        </div>
      </div>
    </motion.div>,
  ];

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="fml" style={{ minHeight: '100vh', padding: '2rem 1rem 5rem' }}>

      {/* Blobs de fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-8%', width: '42%', height: '42%', background: 'rgba(49,194,219,.13)', borderRadius: '50%', filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-8%', width: '38%', height: '38%', background: 'rgba(29,168,191,.09)', borderRadius: '50%', filter: 'blur(90px)' }} />
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* Encabezado */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div className="fml-chip fml-chip-brand" style={{ display: 'inline-flex', marginBottom: '.9rem' }}>
            ♻️ &nbsp;Economía Circular
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 .5rem', letterSpacing: '-.03em', lineHeight: 1.15 }}>
            Publica tu <span style={{ color: '#31C2DB' }}>dispositivo</span>
          </h1>
          <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: '.95rem', margin: 0 }}>
            Comparte tecnología útil y da una segunda vida a tus equipos electrónicos
          </p>
        </motion.div>

        {/* Layout principal */}
        <div className="fml-layout" style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="fml-sidebar" style={{ position: 'sticky', top: '1.5rem' }}>
            <div className="fml-glass" style={{ padding: '1.1rem' }}>
              <StepSidebar activeStep={activeStep} />
            </div>
          </motion.div>

          {/* Contenido principal */}
          <div>
            <AnimatePresence mode="wait">
              {stepPanels[activeStep]}
            </AnimatePresence>

            {/* Navegación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
              <button
                className="fml-btn-outline"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                ← Atrás
              </button>

              {activeStep < stepPanels.length - 1 ? (
                <button
                  className="fml-btn-primary"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && !isPaso1Completo) ||
                    (activeStep === 1 && !isPaso2Completo) ||
                    (activeStep === 2 && !isPaso3Completo)
                  }
                >
                  Continuar →
                </button>
              ) : (
                <button className="fml-btn-primary" onClick={handleSubmit}>
                  <PublishIcon style={{ fontSize: '1.1rem' }} /> Publicar
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Formulario;