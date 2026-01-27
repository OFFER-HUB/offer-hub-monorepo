-- ============================================
-- Migración: Mejorar device_info en refresh_tokens
-- ============================================
-- Agrega columnas para mejor seguimiento de sesiones
-- ============================================

ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS device_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS browser VARCHAR(50),
  ADD COLUMN IF NOT EXISTS os VARCHAR(50);

-- Comentarios para documentación
COMMENT ON COLUMN refresh_tokens.user_agent IS 'User-Agent completo de la sesión';
COMMENT ON COLUMN refresh_tokens.ip_hash IS 'Hash SHA-256 de la dirección IP para privacidad';
COMMENT ON COLUMN refresh_tokens.last_used_at IS 'Fecha del último uso del token (refresh)';
COMMENT ON COLUMN refresh_tokens.device_type IS 'Tipo de dispositivo (Desktop/Mobile/Tablet)';
COMMENT ON COLUMN refresh_tokens.browser IS 'Nombre del navegador';
COMMENT ON COLUMN refresh_tokens.os IS 'Sistema operativo';

-- Índices para mejorar el rendimiento de consultas de sesiones
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_last_used_at ON refresh_tokens(last_used_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_ip_hash ON refresh_tokens(ip_hash);
