-- Migración: soporte para donaciones en publicaciones
-- Ejecuta este script en tu base de datos PostgreSQL UNA sola vez

ALTER TABLE publicaciones
  ADD COLUMN IF NOT EXISTS usuario_receptor_id INTEGER REFERENCES usuarios(id),
  ADD COLUMN IF NOT EXISTS fecha_donacion      TIMESTAMP DEFAULT NULL;

-- Asegura que 'Donado' sea un valor válido para la columna estado
-- (si tu columna estado tiene un CHECK constraint, agrégalo aquí)
-- Ejemplo: ALTER TABLE publicaciones DROP CONSTRAINT IF EXISTS publicaciones_estado_check;
-- Luego recrear con: ADD CONSTRAINT publicaciones_estado_check CHECK (estado IN ('Buen estado','Usado','Reciclaje','Donado'));
