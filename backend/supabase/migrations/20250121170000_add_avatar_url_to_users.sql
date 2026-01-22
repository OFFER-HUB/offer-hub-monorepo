-- ============================================
-- Migración 010: Agregar campo avatar_url a tabla users
-- ============================================
-- Agrega el campo avatar_url para almacenar URLs de avatares de usuario
-- ============================================

ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Comentario para documentación
COMMENT ON COLUMN users.avatar_url IS 'URL del avatar del usuario, debe ser una URL válida a una imagen externa';

-- Índice para búsquedas (aunque no es común buscar por avatar, lo incluimos por consistencia)
CREATE INDEX idx_users_avatar_url ON users(avatar_url) WHERE avatar_url IS NOT NULL;