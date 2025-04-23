import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { 
  TextField, Button, Container, MenuItem, Select, InputLabel, FormControl, 
  Typography, Box, Card, CardContent, CardMedia, CircularProgress,
  Paper, Stepper, Step, StepLabel, StepContent, Grid, Divider, Chip,
  Fade, Tooltip, IconButton, LinearProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DevicesIcon from '@mui/icons-material/Devices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublishIcon from '@mui/icons-material/Publish';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDA6ZQGx-Ih-qm7IaIiaPGeKnY7Z4OyRk4';

// Dispositivos electrónicos comunes y sus categorías
const dispositivosDB = {
  'laptop': {
    categoria: 'Computadoras y Accesorios',
    estado: 'Usado', // Por defecto
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

// Función mejorada para detectar dispositivo basado en análisis de la imagen
const detectarDispositivoPorImagen = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const { width, height } = img;
        const ratio = width / height;
        
        console.log('Proporción de imagen (ancho/alto):', ratio);
        
        // Smartphones típicamente tienen ratio entre 0.4 y 0.6 (más alto que ancho)
        if (ratio >= 0.4 && ratio <= 0.6) {
          resolve('smartphone');
        } 
        // Tablets típicamente tienen ratio entre 0.6 y 0.8
        else if (ratio > 0.6 && ratio <= 0.8) {
          resolve('tablet');
        }
        // Laptops y monitores típicamente tienen ratio mayor a 1.2
        else if (ratio > 1.2) {
          resolve('laptop');
        }
        // Para otros ratios más cuadrados
        else if (ratio > 0.8 && ratio <= 1.2) {
          resolve('tablet'); // Posiblemente una tablet cuadrada
        }
        else {
          // Por defecto, usar smartphone como dispositivo más común
          resolve('smartphone');
        }
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  });
};

// Detectar por nombre de archivo (mejora respecto a la versión original)
const detectarDispositivoPorNombre = (nombreArchivo) => {
  nombreArchivo = nombreArchivo.toLowerCase();
  
  // Lista de palabras clave para detectar
  const keywordMap = {
    'laptop': 'laptop',
    'notebook': 'laptop',
    'portatil': 'laptop',
    'phone': 'smartphone',
    'movil': 'smartphone',
    'celular': 'smartphone',
    'smartphone': 'smartphone',
    'iphone': 'smartphone',
    'android': 'smartphone',
    'vivo': 'smartphone', // Marca Vivo añadida
    'samsung': 'smartphone',
    'xiaomi': 'smartphone',
    'huawei': 'smartphone',
    'tablet': 'tablet',
    'ipad': 'tablet',
    'desktop': 'desktop computer',
    'pc': 'desktop computer',
    'monitor': 'monitor',
    'pantalla': 'monitor',
    'teclado': 'keyboard',
    'keyboard': 'keyboard',
    'mouse': 'mouse',
    'raton': 'mouse',
    'printer': 'printer',
    'impresora': 'printer',
    'fridge': 'refrigerator',
    'refrigerador': 'refrigerator',
    'microwave': 'microwave',
    'microondas': 'microwave',
    'tv': 'tv',
    'television': 'tv',
    'headphone': 'headphones',
    'auricular': 'headphones'
  };
  
  for (const [keyword, device] of Object.entries(keywordMap)) {
    if (nombreArchivo.includes(keyword)) {
      return device;
    }
  }
  
  // Si no se encuentra coincidencia, devolver null para priorizar
  // el reconocimiento por imagen
  return null;
};

// Componente principal
const Formulario = () => {
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
  
  // Efecto para manejar el progreso de reconocimiento visual
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
    return () => {
      clearInterval(interval);
    };
  }, [isRecognizing]);

  // Inicializar el mapa de Google
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Verificar si el script ya está cargado para evitar duplicación
      if (!window.google || !window.google.maps) {
        window.initMap = initMap;
        
        // Limpiar cualquier script previo para evitar problemas
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          existingScript.remove();
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        script.onerror = () => {
          console.error('Error al cargar el script de Google Maps');
        };
      } else {
        initMap();
      }
    };

    // Pequeño retraso para asegurar que el DOM esté listo
    if (activeStep === 2) {
      setTimeout(loadGoogleMapsScript, 500);
    }
    
    // Limpieza al desmontar el componente
    return () => {
      // Eliminar cualquier listener global
      delete window.initMap;
    };
  }, [activeStep]);

  const initMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) {
      console.log('Google Maps no está disponible o el contenedor del mapa no existe');
      return;
    }

    try {
      // Usar una ubicación por defecto en caso de que la geolocalización falle
      const defaultLocation = { lat: 19.4326, lng: -99.1332 }; // Ciudad de México
      
      // Inicializar el mapa con la ubicación por defecto
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        styles: [
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }]
          },
          {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{ "color": "#dedede" }, { "lightness": 21 }]
          }
        ]
      });
      
      // Crear marcador en la ubicación por defecto
      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 10
        }
      });
      
      // Configurar geocodificador
      const geocoder = new window.google.maps.Geocoder();
      
      // Intentar obtener la ubicación actual del usuario
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };
          
          // Actualizar el centro del mapa
          map.setCenter(userLocation);
          marker.setPosition(userLocation);
          
          // Geocodificar la ubicación
          geocoder.geocode({ location: userLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              let city = '';
              let country = '';
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
          // Ya tenemos el mapa inicializado con la ubicación por defecto,
          // así que podemos continuar con esa ubicación
          geocoder.geocode({ location: defaultLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              let city = '';
              let country = '';
              results[0].address_components.forEach(component => {
                if (component.types.includes('locality')) city = component.long_name;
                if (component.types.includes('country')) country = component.long_name;
              });
              setFormData((prev) => ({ ...prev, ubicacion: `${city}, ${country}` }));
            }
          });
        },
        { timeout: 10000 } // 10 segundos de timeout
      );
      
      // Configurar evento para actualizar la ubicación al arrastrar el marcador
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            let city = '';
            let country = '';
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

  // Configuración de dropzone para carga de imágenes
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        alert('Por favor, sube una imagen válida.');
        return;
      }
      
      const file = acceptedFiles[0];
      console.log('Archivo aceptado:', file.name);
      
      // Actualizar la previsualización inmediatamente
      setFormData(prev => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file)
      }));
      
      // Solo intentar reconocimiento si está activo
      if (reconocimientoActivo) {
        setIsRecognizing(true);
        
        try {
          // Primero intentar detectar por análisis de imagen - PRIORIDAD
          let dispositivo = await detectarDispositivoPorImagen(file);
          console.log('Dispositivo detectado por imagen:', dispositivo);
          
          // Si no se detectó por imagen o es ambiguo, intentar por nombre de archivo
          if (!dispositivo) {
            const dispositivoPorNombre = detectarDispositivoPorNombre(file.name);
            if (dispositivoPorNombre) {
              dispositivo = dispositivoPorNombre;
              console.log('Dispositivo detectado por nombre:', dispositivo);
            }
          }
          
          // Guardar el dispositivo detectado
          setLastDetectedDevice(dispositivo);
          
          // Actualizar el formulario con la información
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
          // En caso de error, intentamos usar nombre de archivo como última opción
          const dispositivoPorNombre = detectarDispositivoPorNombre(file.name);
          const dispositivo = dispositivoPorNombre || 'smartphone'; // Default a smartphone como más común
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
          setTimeout(() => {
            setIsRecognizing(false);
          }, 1000);
        }
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
  
    // Verificar si el usuario está logueado
    const usuario = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    if (!usuario || !usuario.id) {
      alert('Debes iniciar sesión para publicar');
      return;
    }
  
    // Validar que todos los campos requeridos estén completos
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
  
    // Preparar FormData para envío
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'fotoPreview') form.append(key, formData[key]);
    });
  
    form.append('autor_id', usuario.id);
  
    try {
      // Mostrar indicador de carga
      const loadingIndicator = document.createElement('div');
      loadingIndicator.style.position = 'fixed';
      loadingIndicator.style.top = '0';
      loadingIndicator.style.left = '0';
      loadingIndicator.style.width = '100%';
      loadingIndicator.style.height = '100%';
      loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
      loadingIndicator.style.display = 'flex';
      loadingIndicator.style.justifyContent = 'center';
      loadingIndicator.style.alignItems = 'center';
      loadingIndicator.style.zIndex = '9999';
      loadingIndicator.innerHTML = '<div style="background: white; padding: 20px; border-radius: 10px;"><h3>Publicando...</h3></div>';
      document.body.appendChild(loadingIndicator);
      
      // Enviar datos al servidor
      const response = await axios.post('http://localhost:5000/api/publicaciones', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Eliminar indicador de carga
      document.body.removeChild(loadingIndicator);
      
      // Mostrar mensaje de éxito
      alert('Publicación realizada con éxito');
      
      // Limpiar formulario
      setFormData({
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
      
      // Reiniciar al paso 1
      setActiveStep(0);
      
      // Opcionalmente, redirigir al usuario a otra página
      // window.location.href = '/mis-publicaciones';
    } catch (error) {
      console.error('Error al publicar:', error);
      alert('Error al publicar: ' + (error.response?.data?.message || error.message));
    }
  };

  // Función para alternar el reconocimiento automático
  const toggleReconocimiento = () => {
    setReconocimientoActivo(!reconocimientoActivo);
  };

  // Función para corregir manualmente el dispositivo detectado
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

  // Función para avanzar al siguiente paso
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Función para retroceder al paso anterior
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Comprobar si el paso está completo
  const isPaso1Completo = formData.foto && formData.nombredeldispositivo;
  const isPaso2Completo = formData.titulo && formData.categoria && formData.estado && formData.descripcion;
  const isPaso3Completo = formData.contacto && formData.ubicacion;

  // Pasos del formulario
  const steps = [
    {
      label: 'Sube una foto del dispositivo',
      icon: <CameraAltIcon />,
      content: (
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ overflow: 'visible', marginBottom: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DevicesIcon sx={{ color: '#0099cc', marginRight: 1 }} />
                    <Typography variant="body1" color="primary" fontWeight="medium">
                      Reconocimiento automático de dispositivos
                    </Typography>
                    <Tooltip title="El sistema reconocerá automáticamente el tipo de dispositivo a partir de la imagen que subas" placement="top">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <IconButton 
                    color={reconocimientoActivo ? "primary" : "default"}
                    onClick={toggleReconocimiento}
                    size="large"
                  >
                    {reconocimientoActivo ? <ToggleOnIcon fontSize="large" /> : <ToggleOffIcon fontSize="large" />}
                  </IconButton>
                </Box>
              
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Paper
                    elevation={3}
                    {...getRootProps()} 
                    sx={{ 
                      margin: '1rem 0', 
                      textAlign: 'center', 
                      padding: 4, 
                      border: '2px dashed #0099cc', 
                      borderRadius: 3, 
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: '#f8f9fa',
                      backgroundImage: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 180
                    }}
                  >
                    <input {...getInputProps()} />
                    <CameraAltIcon sx={{ fontSize: 50, color: '#0099cc', mb: 2 }} />
                    <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                      Sube una foto del dispositivo
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Arrastra una imagen o haz clic para seleccionar
                    </Typography>
                    {reconocimientoActivo && (
                      <Chip 
                        label="Reconocimiento automático activado" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 2 }} 
                        variant="outlined" 
                      />
                    )}
                  </Paper>
                </motion.div>

                {isRecognizing && (
                  <Fade in={isRecognizing}>
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 'medium', color: '#0099cc' }}>
                          Analizando imagen...
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {`${Math.round(progress)}%`}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 2,
                          backgroundColor: '#e3f2fd',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#0099cc',
                          }
                        }} 
                      />
                    </Box>
                  </Fade>
                )}

                {formData.fotoPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{ 
                      marginTop: 3, 
                      boxShadow: 3,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      <CardMedia 
                        component="img" 
                        image={formData.fotoPreview} 
                        alt="Previsualización" 
                        sx={{ height: 300, objectFit: 'contain', backgroundColor: '#f5f5f5' }} 
                      />
                      {lastDetectedDevice && (
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: '#e3f2fd',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                            <Typography variant="body1" color="primary" fontWeight="medium">
                              Dispositivo detectado: <strong>{lastDetectedDevice}</strong>
                            </Typography>
                          </Box>
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                            onClick={corregirDispositivo}
                            startIcon={<EditIcon />}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 'medium'
                            }}
                          >
                            Corregir
                          </Button>
                        </Box>
                      )}
                    </Card>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      )
    },
    {
      label: 'Información del dispositivo',
      icon: <DevicesIcon />,
      content: (
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ overflow: 'visible', marginBottom: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                  Detalles del dispositivo
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="Título de la publicación" 
                      name="titulo" 
                      value={formData.titulo} 
                      onChange={handleChange} 
                      fullWidth 
                      required 
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="Nombre del dispositivo" 
                      name="nombredeldispositivo" 
                      value={formData.nombredeldispositivo} 
                      onChange={handleChange} 
                      fullWidth 
                      required 
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="Marca o Modelo" 
                      name="marcaoModelo" 
                      value={formData.marcaoModelo} 
                      onChange={handleChange} 
                      fullWidth
                      variant="outlined"
                      placeholder="Ej: HP Pavilion, iPhone 12, Samsung Galaxy"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel>Categoría</InputLabel>
                      <Select 
                        name="categoria" 
                        value={formData.categoria} 
                        onChange={handleChange} 
                        label="Categoría"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="Computadoras y Accesorios">Computadoras y Accesorios</MenuItem>
                        <MenuItem value="Teléfonos y Accesorios">Teléfonos y Accesorios</MenuItem>
                        <MenuItem value="Electrodomésticos">Electrodomésticos</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel>Estado</InputLabel>
                      <Select 
                        name="estado" 
                        value={formData.estado} 
                        onChange={handleChange} 
                        label="Estado"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="Nuevo">Nuevo</MenuItem>
                        <MenuItem value="Como nuevo">Como nuevo</MenuItem>
                        <MenuItem value="Buen estado">Buen estado</MenuItem>
                        <MenuItem value="Usado">Usado</MenuItem>
                        <MenuItem value="Dañado">Dañado</MenuItem>
                        <MenuItem value="Desuso">Desuso</MenuItem>
                        <MenuItem value="Irreparable">Irreparable</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      label="Descripción" 
                      name="descripcion" 
                      value={formData.descripcion} 
                      onChange={handleChange} 
                      fullWidth 
                      multiline 
                      rows={4} 
                      required 
                      variant="outlined"
                      placeholder="Describe las características, estado y cualquier información relevante del dispositivo"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      )
    },
    {
      label: 'Ubicación y contacto',
      icon: <LocationOnIcon />,
      content: (
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ overflow: 'visible', marginBottom: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                  Ubicación del dispositivo
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  Arrastra el marcador a la ubicación exacta donde se encuentra el dispositivo o donde prefieres hacer la entrega.
                </Typography>
                
                <Box 
                  ref={mapRef} 
                  sx={{ 
                    height: 300, 
                    marginBottom: 3, 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                
                <TextField 
                  label="Ubicación" 
                  name="ubicacion" 
                  value={formData.ubicacion} 
                  fullWidth 
                  margin="normal" 
                  disabled 
                  variant="outlined"
                  helperText="La ubicación se determina automáticamente basada en el mapa"
                  InputProps={{
                    startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: { borderRadius: 2 }
                  }}
                />
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                  Información de contacto
                </Typography>
                
                <TextField 
                  label="Contacto" 
                  name="contacto" 
                  value={formData.contacto} 
                  onChange={handleChange} 
                  fullWidth 
                  margin="normal" 
                  required 
                  variant="outlined"
                  placeholder="Email, teléfono o forma de contacto"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      )
    },
    {
      label: 'Publicar',
      icon: <PublishIcon />,
      content: (
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ overflow: 'visible', marginBottom: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                    Resumen de la publicación
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Verifica que todos los datos sean correctos antes de publicar.
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      boxShadow: 2,
                      borderRadius: 2
                    }}>
                      <CardMedia 
                        component="img" 
                        image={formData.fotoPreview} 
                        alt="Previsualización" 
                        sx={{ height: 200, objectFit: 'contain', backgroundColor: '#f5f5f5' }} 
                      />
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom fontWeight="medium">
                          {formData.titulo}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {formData.descripcion.length > 100 
                            ? formData.descripcion.substring(0, 100) + '...' 
                            : formData.descripcion}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Dispositivo:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formData.nombredeldispositivo}
                          {formData.marcaoModelo && ` - ${formData.marcaoModelo}`}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Categoría:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formData.categoria}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Estado:
                        </Typography>
                        <Chip 
                          label={formData.estado}
                          size="small" 
                          color={
                            formData.estado === 'Nuevo' || formData.estado === 'Como nuevo' 
                              ? 'success' 
                              : formData.estado === 'Buen estado' || formData.estado === 'Usado'
                                ? 'primary'
                                : 'warning'
                          }
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Ubicación:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formData.ubicacion}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Contacto:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formData.contacto}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    onClick={handleSubmit}
                    variant="contained" 
                    size="large"
                    startIcon={<PublishIcon />}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: '#0099cc', 
                      '&:hover': { backgroundColor: '#0077aa' },
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1.1rem'
                    }}
                  >
                    Publicar dispositivo
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 4, paddingBottom: 8 }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            textAlign: 'center', 
            marginBottom: 4, 
            p: 3, 
            borderRadius: 3,
            background: 'linear-gradient(45deg, #0099cc 0%, #33b5e5 100%)'
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="white">
            Publica tu dispositivo
          </Typography>
          <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
            Comparte tecnología útil y da una segunda vida a tus equipos electrónicos
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ position: 'sticky', top: 20, borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ py: 1 }}>
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        StepIconProps={{
                          sx: {
                            '& .MuiStepIcon-root': {
                              color: index === activeStep ? '#0099cc' : '#e0e0e0',
                            },
                            '& .MuiStepIcon-text': {
                              fill: index === activeStep ? 'white' : '#757575',
                            },
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {step.icon}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              ml: 1, 
                              fontWeight: index === activeStep ? 'bold' : 'regular'
                            }}
                          >
                            {step.label}
                          </Typography>
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="caption" color="textSecondary">
                          {index === 0 && "Sube una foto para el reconocimiento automático"}
                          {index === 1 && "Completa la información básica del dispositivo"}
                          {index === 2 && "Indica dónde está ubicado y tus datos de contacto"}
                          {index === 3 && "Verifica los datos y publica tu dispositivo"}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {steps[activeStep].content}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: 2,
                    fontWeight: 'medium',
                    borderColor: '#0099cc',
                    color: '#0099cc',
                    '&:hover': {
                      borderColor: '#0077aa',
                      backgroundColor: 'rgba(0, 153, 204, 0.04)'
                    }
                  }}
                >
                  Atrás
                </Button>
                <Box>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={
                        (activeStep === 0 && !isPaso1Completo) ||
                        (activeStep === 1 && !isPaso2Completo) ||
                        (activeStep === 2 && !isPaso3Completo)
                      }
                      sx={{ 
                        textTransform: 'none', 
                        borderRadius: 2,
                        fontWeight: 'medium',
                        backgroundColor: '#0099cc',
                        '&:hover': { backgroundColor: '#0077aa' }
                      }}
                    >
                      Continuar
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      sx={{ 
                        textTransform: 'none', 
                        borderRadius: 2,
                        fontWeight: 'medium',
                        backgroundColor: '#0099cc',
                        '&:hover': { backgroundColor: '#0077aa' }
                      }}
                    >
                      Publicar
                    </Button>
                  )}
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Formulario;