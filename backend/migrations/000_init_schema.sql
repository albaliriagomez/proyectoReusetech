-- Migración 000: Esquema base inicial de la aplicación ReUseTech
-- Todas las declaraciones usan IF NOT EXISTS para garantizar total idempotencia.

-- 1. Tabla de control de migraciones aplicadas
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Particular' CHECK (rol IN ('Particular', 'Fundacion', 'Gestor_RAEE', 'admin')),
    activo BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Verificaciones de Salud por IA
CREATE TABLE IF NOT EXISTS verificaciones_salud (
    id SERIAL PRIMARY KEY,
    dispositivo VARCHAR(255) NOT NULL,
    estado_calculado VARCHAR(100) NOT NULL,
    respuestas_json JSONB NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Publicaciones
CREATE TABLE IF NOT EXISTS publicaciones (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    nombredeldispositivo VARCHAR(255),
    marcaoModelo VARCHAR(255),
    categoria VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    descripcion TEXT,
    contacto VARCHAR(255),
    ubicacion VARCHAR(255),
    foto VARCHAR(255),
    autor_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    visible BOOLEAN DEFAULT true,
    usuario_receptor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_donacion TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    verificacion_id INTEGER REFERENCES verificaciones_salud(id)
);

-- 5. Tabla de Mensajes (Chat entre usuarios)
CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    remitente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    destinatario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    publicacion_id INTEGER REFERENCES publicaciones(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asegurar nulabilidad si la tabla mensajes ya fue creada con restricción NOT NULL en ejecuciones previas
ALTER TABLE mensajes ALTER COLUMN destinatario_id DROP NOT NULL;
ALTER TABLE mensajes ALTER COLUMN remitente_id DROP NOT NULL;
ALTER TABLE mensajes ALTER COLUMN publicacion_id DROP NOT NULL;

-- 6. Tabla de Comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    publicacion_id INTEGER REFERENCES publicaciones(id) ON DELETE CASCADE,
    autor_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asegurar nulabilidad si la tabla comentarios ya fue creada con restricción NOT NULL en ejecuciones previas
ALTER TABLE comentarios ALTER COLUMN publicacion_id DROP NOT NULL;
ALTER TABLE comentarios ALTER COLUMN autor_id DROP NOT NULL;

-- 7. Índices para optimizar búsquedas y consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_publicaciones_autor ON publicaciones(autor_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_categoria ON publicaciones(categoria);
CREATE INDEX IF NOT EXISTS idx_publicaciones_estado ON publicaciones(estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_publicacion ON mensajes(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente_destinatario ON mensajes(remitente_id, destinatario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_publicacion ON comentarios(publicacion_id);


