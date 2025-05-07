"use client"

import { useState, useRef, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Container,
} from "@mui/material"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto"
import StopIcon from "@mui/icons-material/Stop"
import BuildIcon from "@mui/icons-material/Build"
import RecyclingIcon from "@mui/icons-material/Recycling"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone"
import LaptopIcon from "@mui/icons-material/Laptop"
import DevicesIcon from "@mui/icons-material/Devices"
import TabletIcon from "@mui/icons-material/Tablet"
import WatchIcon from "@mui/icons-material/Watch"
import ComputerIcon from "@mui/icons-material/Computer"
import { motion } from "framer-motion"
import * as tf from '@tensorflow/tfjs';
import { crearModelo, predecirDispositivo, generarDiagnostico, evaluarEstadoVisual } from './modeloClasificador';

const DiagnosticoInteligente = () => {
  const [imagen, setImagen] = useState(null)
  const [previsualizacion, setPrevisualizacion] = useState(null)
  const [analizando, setAnalizando] = useState(false)
  const [usoWebcam, setUsoWebcam] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [progreso, setProgreso] = useState(0)
  const [modoDemo, setModoDemo] = useState(false)
  const [modelo, setModelo] = useState(null)
  const [modeloCargado, setModeloCargado] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const imagenPreviewRef = useRef(null)

  // Cargar modelo cuando se monta el componente
  useEffect(() => {
    const cargarModelo = async () => {
      try {
        console.log("Cargando modelo TensorFlow.js...");
        const modeloTF = await crearModelo();
        setModelo(modeloTF);
        setModeloCargado(true);
        console.log("Modelo cargado correctamente");
      } catch (err) {
        console.error("Error al cargar el modelo:", err);
        setError("No se pudo cargar el modelo de análisis. Por favor, recargue la página.");
      }
    };

    cargarModelo();

    // Limpiar al desmontar
    return () => {
      if (modelo) {
        try {
          modelo.dispose();
        } catch (err) {
          console.error("Error al liberar el modelo:", err);
        }
      }
    };
  }, []);

  // Efecto para el progreso del análisis
  useEffect(() => {
    let intervalo
    if (analizando) {
      setProgreso(0)
      intervalo = setInterval(() => {
        setProgreso((prevProgreso) => {
          const nuevoProgreso = prevProgreso + 10
          if (nuevoProgreso >= 100) {
            clearInterval(intervalo)
            return 100
          }
          return nuevoProgreso
        })
      }, 300)
    } else {
      setProgreso(0)
    }
    return () => {
      clearInterval(intervalo)
    }
  }, [analizando])

  // Limpiar stream de la cámara al desmontar el componente
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop()
        })
      }
    }
  }, [])

  // Iniciar cámara web
  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setUsoWebcam(true)
        // Limpiar cualquier imagen previa
        setPrevisualizacion(null)
        setImagen(null)
        setResultado(null)
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err)
      setError("No se pudo acceder a la cámara. Por favor verifica los permisos.")
    }
  }

  // Detener cámara web
  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
      videoRef.current.srcObject = null
      setUsoWebcam(false)
    }
  }

  // Tomar foto desde la cámara
  const tomarFoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        async (blob) => {
          const file = new File([blob], "camara-captura.jpg", { type: "image/jpeg" })
          setImagen(file)
          
          // Crear una URL para la previsualización
          const urlPreview = URL.createObjectURL(blob)
          setPrevisualizacion(urlPreview)
          
          // Detener la cámara
          detenerCamara()
          
          // Crear un elemento de imagen para el análisis
          const img = new Image()
          img.onload = async () => {
            await analizarImagen(img)
          }
          img.src = urlPreview
        },
        "image/jpeg",
        0.95,
      )
    }
  }

  // Seleccionar imagen del dispositivo
  const seleccionarImagen = async (event) => {
    const file = event.target.files[0]
    if (file) {
      setImagen(file)
      const urlPreview = URL.createObjectURL(file)
      setPrevisualizacion(urlPreview)
      
      // Crear un elemento de imagen para el análisis
      const img = new Image()
      img.onload = async () => {
        await analizarImagen(img)
      }
      img.src = urlPreview
    }
  }

  // Abrir selector de archivos
  const abrirSelectorArchivos = () => {
    fileInputRef.current.click()
  }

  // Activar modo demo
  const activarModoDemo = () => {
    setAnalizando(true)
    setResultado(null)
    setError(null)

    // Simular análisis
    setTimeout(() => {
      // Resultado de ejemplo para el modo demo
      const resultadoEjemplo = {
        nombre: "Samsung Galaxy S21",
        tipo: "smartphone",
        marca: "Samsung",
        modelo: "Galaxy S21",
        estadoFisico: {
          porcentaje: 85,
          descripcion: "El dispositivo se encuentra en buen estado general con mínimos signos de uso.",
        },
        diagnostico:
          "Este smartphone Samsung Galaxy S21 se encuentra en buen estado. No parece necesitar reparaciones urgentes y podría seguir funcionando correctamente por un tiempo.",
        recomendacion: "Donar",
        sugerencias: [
          {
            tipo: "reparacion",
            titulo: "Reparación recomendada",
            descripcion:
              "Este smartphone Samsung Galaxy S21 podría ser reparado para extender su vida útil. Recomendamos llevarlo a un técnico especializado para un diagnóstico detallado.",
          },
          {
            tipo: "donacion",
            titulo: "Considere donar el dispositivo",
            descripcion:
              "Este smartphone aún puede ser útil para alguien más. Muchas organizaciones benéficas aceptan donaciones de dispositivos electrónicos usados para personas que los necesitan.",
          },
          {
            tipo: "reciclaje",
            titulo: "Opción de reciclaje responsable",
            descripcion:
              "Si decide no reparar o donar el dispositivo, por favor considere llevarlo a un centro de reciclaje electrónico especializado para evitar la contaminación ambiental.",
          },
        ],
      }
      setResultado(resultadoEjemplo)
      setAnalizando(false)
      setModoDemo(true)
    }, 2000)
  }

  // Analizar la imagen con TensorFlow.js
  const analizarImagen = async (imagenElement) => {
    // Si está activado el modo demo o no hay modelo, usar datos de ejemplo
    if (modoDemo || !modeloCargado) {
      activarModoDemo();
      return;
    }

    setAnalizando(true);
    setResultado(null);
    setError(null);

    try {
      console.log("Analizando imagen con TensorFlow.js...");
      
      // Usar el modelo para predecir el tipo de dispositivo
      const prediccion = await predecirDispositivo(modelo, imagenElement);
      console.log("Predicción:", prediccion);
      
      // Evaluar el estado visual del dispositivo
      const estadoVisual = evaluarEstadoVisual(imagenElement);
      console.log("Estado visual estimado:", estadoVisual);
      
      // Generar diagnóstico completo
      const diagnostico = generarDiagnostico(prediccion.categoria, estadoVisual);
      console.log("Diagnóstico generado:", diagnostico);
      
      // Mostrar resultado después de un pequeño retraso para simular procesamiento
      setTimeout(() => {
        setResultado(diagnostico);
        setAnalizando(false);
      }, 1000);
      
    } catch (err) {
      console.error("Error al analizar la imagen con TensorFlow.js:", err);
      setError("Ocurrió un error al analizar la imagen. Por favor, intenta nuevamente.");
      setAnalizando(false);
    }
  };

  // Componente para renderizar la sección de sugerencias
  const Sugerencias = ({ resultado }) => {
    if (!resultado || !resultado.sugerencias) return null

    return (
      <Card sx={{ mt: 2, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
            Sugerencias
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {resultado.sugerencias.map((sugerencia, index) => (
              <Grid item xs={12} key={index}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: "#f5f9ff" }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    {sugerencia.tipo === "reparacion" && <BuildIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />}
                    {sugerencia.tipo === "reciclaje" && <RecyclingIcon color="success" sx={{ mr: 1, mt: 0.5 }} />}
                    {sugerencia.tipo === "donacion" && <DevicesIcon color="secondary" sx={{ mr: 1, mt: 0.5 }} />}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        {sugerencia.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sugerencia.descripcion}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    )
  }

  // Función para renderizar el icono según el tipo de dispositivo
  const renderDispositivoIcon = (tipo) => {
    switch (tipo) {
      case 'smartphone':
        return <PhoneIphoneIcon sx={{ mr: 1, color: "#0099cc" }} />;
      case 'laptop':
        return <LaptopIcon sx={{ mr: 1, color: "#0099cc" }} />;
      case 'tablet':
        return <TabletIcon sx={{ mr: 1, color: "#0099cc" }} />;
      case 'smartwatch':
        return <WatchIcon sx={{ mr: 1, color: "#0099cc" }} />;
      case 'desktop':
        return <ComputerIcon sx={{ mr: 1, color: "#0099cc" }} />;
      default:
        return <DevicesIcon sx={{ mr: 1, color: "#0099cc" }} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            marginBottom: 4,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(45deg, #0099cc 0%, #33b5e5 100%)",
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="white">
            Diagnóstico Inteligente
          </Typography>
          <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
            Escanea tu dispositivo electrónico para identificarlo y conocer sus posibilidades
          </Typography>
        </Paper>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ height: "100%", borderRadius: 3, overflow: "hidden" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Escanear Dispositivo
                  </Typography>
                  <Tooltip title="Escanea tu dispositivo con la cámara o sube una foto para recibir un diagnóstico inteligente">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {/* Área de cámara o previsualización */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: 300,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  {usoWebcam ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : previsualizacion ? (
                    <img
                      ref={imagenPreviewRef}
                      src={previsualizacion || "/placeholder.svg"}
                      alt="Previsualización"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <Box sx={{ textAlign: "center", p: 3 }}>
                      <DevicesIcon sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }} />
                      <Typography color="textSecondary">Utiliza la cámara o sube una imagen</Typography>
                    </Box>
                  )}

                  {analizando && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        zIndex: 10,
                      }}
                    >
                      <CircularProgress color="primary" size={60} sx={{ mb: 2 }} />
                      <Typography color="white" variant="h6">
                        Analizando...
                      </Typography>
                      <Box sx={{ width: "80%", mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progreso}
                          sx={{
                            height: 8,
                            borderRadius: 2,
                            backgroundColor: "rgba(255,255,255,0.2)",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#0099cc",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Estado del modelo */}
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Chip 
                    label={modeloCargado ? "Modelo AI cargado" : "Cargando modelo AI..."}
                    color={modeloCargado ? "success" : "warning"}
                    size="small"
                    sx={{ fontWeight: "medium" }}
                  />
                </Box>

                {/* Botones de acción */}
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  {usoWebcam ? (
                    <>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          onClick={detenerCamara}
                          startIcon={<StopIcon />}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: "medium",
                          }}
                        >
                          Detener cámara
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={tomarFoto}
                          startIcon={<CameraAltIcon />}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: "bold",
                            backgroundColor: "#0099cc",
                            "&:hover": { backgroundColor: "#0077aa" },
                          }}
                        >
                          Tomar foto
                        </Button>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          onClick={iniciarCamara}
                          startIcon={<CameraAltIcon />}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: "medium",
                          }}
                        >
                          Usar cámara
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id="upload-image"
                          type="file"
                          ref={fileInputRef}
                          onChange={seleccionarImagen}
                        />
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          onClick={abrirSelectorArchivos}
                          startIcon={<PhotoLibraryIcon />}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: "medium",
                          }}
                        >
                          Subir foto
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          onClick={activarModoDemo}
                          startIcon={<AddAPhotoIcon />}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: "bold",
                          }}
                        >
                          Modo Demo
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>

                {error && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#ffebee" }}>
                    <Typography color="error">{error}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                  Resultados del Análisis
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {resultado ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {renderDispositivoIcon(resultado.tipo)}
                        <Typography variant="h6">{resultado.nombre}</Typography>
                      </Box>
                      <Chip
                        label={resultado.recomendacion}
                        color={
                          resultado.recomendacion === "Donar"
                            ? "primary"
                            : resultado.recomendacion === "Reparar"
                            ? "warning"
                            : "error"
                        }
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>

                    <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "#f8f9fa" }}>
                      <Typography variant="body1" paragraph>
                        {resultado.diagnostico}
                      </Typography>
                    </Paper>

                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                      Estado físico estimado
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={resultado.estadoFisico.porcentaje}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor:
                                resultado.estadoFisico.porcentaje > 70
                                  ? "#4caf50"
                                  : resultado.estadoFisico.porcentaje > 40
                                  ? "#ff9800"
                                  : "#f44336",
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color:
                            resultado.estadoFisico.porcentaje > 70
                              ? "#4caf50"
                              : resultado.estadoFisico.porcentaje > 40
                              ? "#ff9800"
                              : "#f44336",
                          fontWeight: "bold",
                        }}
                      >
                        {resultado.estadoFisico.porcentaje}%
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {resultado.estadoFisico.descripcion}
                    </Typography>

                    <Sugerencias resultado={resultado} />
                  </>
                ) : analizando ? (
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Analizando dispositivo...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <DevicesIcon sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }} />
                    <Typography color="textSecondary">
                      Escanea o sube una foto de tu dispositivo para ver los resultados
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DiagnosticoInteligente