-- Migración: Tabla de verificaciones de salud por IA y FK en publicaciones
-- Ejecuta este script para dar soporte a la auditoría técnica e inmutabilidad de datos

CREATE TABLE IF NOT EXISTS verificaciones_salud (
  id SERIAL PRIMARY KEY,
  dispositivo VARCHAR(255) NOT NULL,
  estado_calculado VARCHAR(100) NOT NULL, -- Almacenará el estado traducido ('Buen estado', 'Usado', 'Reciclaje')
  respuestas_json JSONB NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE publicaciones
  ADD COLUMN IF NOT EXISTS verificacion_id INTEGER REFERENCES verificaciones_salud(id);
