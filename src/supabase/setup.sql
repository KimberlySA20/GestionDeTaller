-- ============================================
-- SETUP COMPLETO - Sistema de Gestión de Taller Mecánico
-- ============================================
-- Ejecute este script en el SQL Editor de Supabase
-- Dashboard: https://supabase.com/dashboard/project/xtpqhsbosazgpwmiifjt/sql
-- ============================================

-- 1. CREAR TABLA KV STORE
-- Esta tabla almacena todos los datos del sistema en formato clave-valor
CREATE TABLE IF NOT EXISTS kv_store_89b561df (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentario descriptivo
COMMENT ON TABLE kv_store_89b561df IS 'Almacenamiento clave-valor para el sistema de gestión de taller mecánico';

-- ============================================
-- 2. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE kv_store_89b561df ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (por si acaso)
DROP POLICY IF EXISTS "Permitir acceso completo a kv_store" ON kv_store_89b561df;
DROP POLICY IF EXISTS "Enable read access for all users" ON kv_store_89b561df;
DROP POLICY IF EXISTS "Enable insert access for all users" ON kv_store_89b561df;
DROP POLICY IF EXISTS "Enable update access for all users" ON kv_store_89b561df;
DROP POLICY IF EXISTS "Enable delete access for all users" ON kv_store_89b561df;

-- ============================================
-- OPCIÓN A: Política Permisiva (Desarrollo)
-- ============================================
-- Esta política permite acceso completo sin restricciones
-- RECOMENDADO SOLO PARA DESARROLLO Y TESTING

CREATE POLICY "Permitir acceso completo a kv_store"
ON kv_store_89b561df
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- OPCIÓN B: Políticas Granulares (Producción)
-- ============================================
-- Descomente estas políticas para producción
-- y comente la política permisiva de arriba

/*
-- Permitir lectura a todos
CREATE POLICY "Enable read access for all users"
ON kv_store_89b561df
FOR SELECT
USING (true);

-- Permitir inserción solo a usuarios autenticados
CREATE POLICY "Enable insert access for all users"
ON kv_store_89b561df
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Permitir actualización solo a usuarios autenticados
CREATE POLICY "Enable update access for all users"
ON kv_store_89b561df
FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Permitir eliminación solo a usuarios autenticados
CREATE POLICY "Enable delete access for all users"
ON kv_store_89b561df
FOR DELETE
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
*/

-- ============================================
-- 3. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

-- Índice para búsquedas por prefijo
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix 
ON kv_store_89b561df (key text_pattern_ops);

-- Índice para búsquedas en el valor JSONB
CREATE INDEX IF NOT EXISTS idx_kv_store_value_gin 
ON kv_store_89b561df USING GIN (value);

-- Índice para ordenar por fecha de actualización
CREATE INDEX IF NOT EXISTS idx_kv_store_updated_at 
ON kv_store_89b561df (updated_at DESC);

-- ============================================
-- 4. CREAR TRIGGER PARA AUTO-ACTUALIZAR updated_at
-- ============================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store_89b561df;

-- Crear trigger
CREATE TRIGGER update_kv_store_updated_at
    BEFORE UPDATE ON kv_store_89b561df
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. DATOS DE PRUEBA (OPCIONAL)
-- ============================================
-- Descomente para insertar datos de prueba

/*
-- Cliente de ejemplo
INSERT INTO kv_store_89b561df (key, value) VALUES (
  'cliente:test-001',
  '{
    "id": "test-001",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@example.com",
    "telefono": "+54 11 1234-5678",
    "direccion": "Av. Corrientes 1234",
    "ciudad": "Buenos Aires",
    "fecha_creacion": "2025-11-19T12:00:00Z"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Vehículo de ejemplo
INSERT INTO kv_store_89b561df (key, value) VALUES (
  'vehiculo:test-001',
  '{
    "id": "test-001",
    "cliente_id": "test-001",
    "marca": "Toyota",
    "modelo": "Corolla",
    "año": "2020",
    "patente": "ABC123",
    "color": "Blanco",
    "tipo_vehiculo": "automóvil",
    "kilometraje": 50000,
    "fecha_creacion": "2025-11-19T12:00:00Z"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Admisión de ejemplo
INSERT INTO kv_store_89b561df (key, value) VALUES (
  'admision:test-001',
  '{
    "id": "test-001",
    "vehiculo_id": "test-001",
    "cliente_id": "test-001",
    "numero_orden": "ORD-001",
    "fecha_ingreso": "2025-11-19",
    "hora_ingreso": "14:30",
    "estado": "pendiente",
    "prioridad": "media",
    "motivo_ingreso": "Service 50.000 km",
    "kilometraje_actual": 50000,
    "nivel_combustible": "1/2",
    "fecha_creacion": "2025-11-19T12:00:00Z"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;
*/

-- ============================================
-- 6. VERIFICACIÓN
-- ============================================

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'kv_store_89b561df';

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'kv_store_89b561df';

-- Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'kv_store_89b561df';

-- Contar registros (debe ser 0 si no insertó datos de prueba)
SELECT COUNT(*) as total_registros 
FROM kv_store_89b561df;

-- ============================================
-- 7. FUNCIONES AUXILIARES (OPCIONAL)
-- ============================================

-- Función para limpiar datos antiguos (mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_old_kv_data(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM kv_store_89b561df
  WHERE updated_at < NOW() - INTERVAL '1 day' * days_old
    AND key LIKE 'temp:%'; -- Solo eliminar datos temporales
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_kv_data IS 'Elimina datos temporales antiguos de la tabla KV';

-- Función para obtener estadísticas de la tabla
CREATE OR REPLACE FUNCTION kv_store_stats()
RETURNS TABLE (
  total_keys BIGINT,
  total_size TEXT,
  avg_value_size TEXT,
  oldest_record TIMESTAMP WITH TIME ZONE,
  newest_record TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_keys,
    pg_size_pretty(pg_total_relation_size('kv_store_89b561df')) as total_size,
    pg_size_pretty(AVG(pg_column_size(value))::BIGINT) as avg_value_size,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
  FROM kv_store_89b561df;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION kv_store_stats IS 'Obtiene estadísticas de la tabla KV';

-- ============================================
-- SETUP COMPLETADO ✅
-- ============================================

SELECT 'Setup completado exitosamente!' as mensaje,
       NOW() as fecha_ejecucion;

-- Para ver estadísticas de la tabla:
-- SELECT * FROM kv_store_stats();

-- Para limpiar datos temporales antiguos (más de 1 año):
-- SELECT cleanup_old_kv_data(365);
