// src/context/ModelContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import { crearModelo } from '../utils/modeloClasificador';

// Crear contexto
const ModelContext = createContext();

// Proveedor del contexto
export const ModelProvider = ({ children }) => {
  const [modelo, setModelo] = useState(null);
  const [estadoModelo, setEstadoModelo] = useState({
    cargado: false,
    cargando: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const inicializarModelo = async () => {
      try {
        console.log("Iniciando carga del modelo...");
        setEstadoModelo(prev => ({ ...prev, cargando: true }));

        // Opción 1: Cargar un modelo pre-entrenado
        try {
          console.log("Intentando cargar modelo desde /model/model.json");
          const modeloCargado = await tf.loadLayersModel('/model/model.json');
          
          // Compilar el modelo
          modeloCargado.compile({
            optimizer: 'adam',
            loss: 'sparseCategoricalCrossentropy',
            metrics: ['accuracy']
          });
          
          if (mounted) {
            console.log("Modelo pre-entrenado cargado correctamente");
            setModelo(modeloCargado);
            setEstadoModelo({
              cargado: true,
              cargando: false,
              error: null
            });
          }
        } 
        // Opción 2: Crear un modelo desde cero si no se puede cargar el pre-entrenado
        catch (err) {
          console.warn("No se pudo cargar el modelo pre-entrenado, creando modelo desde cero:", err);
          const modeloNuevo = await crearModelo();
          
          if (mounted) {
            console.log("Modelo creado desde cero");
            setModelo(modeloNuevo);
            setEstadoModelo({
              cargado: true,
              cargando: false,
              error: null
            });
          }
        }
      } catch (error) {
        console.error("Error en la inicialización del modelo:", error);
        if (mounted) {
          setEstadoModelo({
            cargado: false,
            cargando: false,
            error: "Error al inicializar el modelo: " + error.message
          });
        }
      }
    };

    inicializarModelo();

    // Cleanup
    return () => {
      mounted = false;
      if (modelo) {
        try {
          modelo.dispose();
          console.log("Modelo liberado correctamente");
        } catch (err) {
          console.error("Error al liberar el modelo:", err);
        }
      }
    };
  }, []);

  // Función para analizar una imagen con el modelo
  const analizarImagen = async (imagenElement) => {
    if (!modelo || !estadoModelo.cargado) {
      throw new Error("El modelo no está disponible");
    }

    // Convertir la imagen a tensor
    const tensor = tf.browser.fromPixels(imagenElement)
      .resizeBilinear([224, 224])
      .expandDims(0);

    // Realizar la predicción
    const prediccion = await modelo.predict(tensor);
    
    // Procesar resultados
    const resultados = await prediccion.data();
    
    // Limpiar tensores para evitar memory leaks
    tf.dispose([tensor, prediccion]);
    
    return resultados;
  };

  // Valores expuestos por el contexto
  const value = {
    modelo,
    estadoModelo,
    analizarImagen
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel debe ser usado dentro de un ModelProvider");
  }
  return context;
};