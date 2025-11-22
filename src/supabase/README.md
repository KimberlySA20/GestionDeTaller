# 🗄️ Supabase - Backend del Sistema

Este directorio contiene toda la configuración del backend basado en Supabase.

---

## 📁 Estructura

```
/supabase/
├── README.md                  ← Este archivo
├── setup.sql                  ← ⭐ Script de configuración DB
└── functions/
    └── server/
        ├── index.tsx          ← Edge Function principal
        └── kv_store.tsx       ← Utilidades KV (protegido)
```

---

## 🚀 Deployment Rápido

### Paso 1: Configurar Base de Datos

Ejecutar el script SQL en Supabase:

1. Ir a https://supabase.com/dashboard/project/xtpqhsbosazgpwmiifjt/sql
2. Crear nueva query
3. Copiar y pegar todo el contenido de [`setup.sql`](./setup.sql)
4. Click en "Run"

**¿Qué hace el script?**
- ✅ Crea tabla `kv_store_89b561df`
- ✅ Configura Row Level Security (RLS)
- ✅ Crea políticas de acceso
- ✅ Crea índices de optimización
- ✅ Agrega triggers y funciones auxiliares

### Paso 2: Desplegar Edge Function

```bash
# Instalar Supabase CLI (si no está instalado)
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref xtpqhsbosazgpwmiifjt

# Desplegar la función
supabase functions deploy server
```

### Paso 3: Verificar

```bash
# Test básico
curl https://xtpqhsbosazgpwmiifjt.supabase.co/functions/v1/server/health

# Debe responder:
# {"status":"ok"}
```

---

## 📄 Archivos Detallados

### setup.sql ⭐

**Propósito:** Configuración completa de la base de datos

**Secciones:**
1. Creación de tabla KV
2. Configuración de RLS
3. Políticas de acceso (desarrollo y producción)
4. Índices de optimización
5. Triggers para timestamps
6. Funciones auxiliares
7. Datos de prueba (opcional)
8. Scripts de verificación

**Uso:**
```sql
-- Copiar y pegar en Supabase SQL Editor
-- https://supabase.com/dashboard/project/xtpqhsbosazgpwmiifjt/sql
```

---

### functions/server/index.tsx

**Propósito:** Edge Function principal (servidor Hono)

**Características:**
- ✅ Framework Hono para routing
- ✅ CORS configurado
- ✅ Logger integrado
- ✅ 25+ endpoints REST
- ✅ Validaciones
- ✅ Manejo de errores

**Endpoints implementados:**

#### Clientes
- `POST /server/clientes` - Crear cliente
- `GET /server/clientes` - Listar todos
- `GET /server/clientes/:id` - Obtener uno
- `PUT /server/clientes/:id` - Actualizar

#### Vehículos
- `POST /server/vehiculos` - Crear vehículo
- `GET /server/vehiculos` - Listar todos
- `GET /server/vehiculos/:id` - Obtener uno
- `GET /server/clientes/:clienteId/vehiculos` - Vehículos de cliente
- `PUT /server/vehiculos/:id` - Actualizar

#### Admisiones
- `POST /server/admisiones` - Crear admisión
- `GET /server/admisiones` - Listar todas
- `GET /server/admisiones/:id` - Obtener una
- `PUT /server/admisiones/:id` - Actualizar
- `PATCH /server/admisiones/:id` - Actualizar parcialmente
- `PUT /server/admisiones/:id/estado` - Cambiar estado

#### Trabajos
- `POST /server/trabajos` - Crear trabajo
- `GET /server/admisiones/:admisionId/trabajos` - Trabajos de admisión
- `PUT /server/trabajos/:id` - Actualizar
- `PATCH /server/trabajos/:id` - Actualizar parcialmente
- `DELETE /server/trabajos/:id` - Eliminar

#### Búsqueda
- `GET /server/buscar/patente/:patente` - Buscar por patente
- `GET /server/buscar/orden/:numeroOrden` - Buscar por orden

#### Estadísticas
- `GET /server/estadisticas` - Estadísticas generales

#### Utilidades
- `GET /server/health` - Health check

---

### functions/server/kv_store.tsx

**Propósito:** Utilidades para interactuar con KV Store

**⚠️ ARCHIVO PROTEGIDO - NO MODIFICAR**

**Funciones exportadas:**
- `set(key, value)` - Guardar valor
- `get(key)` - Obtener valor
- `del(key)` - Eliminar valor
- `mset(keys, values)` - Guardar múltiples
- `mget(keys)` - Obtener múltiples
- `mdel(keys)` - Eliminar múltiples
- `getByPrefix(prefix)` - Buscar por prefijo

---

## 🔧 Configuración

### Variables de Entorno

La Edge Function usa las siguientes variables (automáticas):
- `SUPABASE_URL` - URL del proyecto
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

**Estas variables se configuran automáticamente en Supabase.**

---

## 🧪 Testing

### Test Manual con cURL

```bash
# Health check
curl https://xtpqhsbosazgpwmiifjt.supabase.co/functions/v1/server/health

# Listar clientes
curl https://xtpqhsbosazgpwmiifjt.supabase.co/functions/v1/server/clientes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0cHFoc2Jvc2F6Z3B3bWlpZmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTkzNDYsImV4cCI6MjA3ODYzNTM0Nn0.CroohNlRTzzoz1IWTG9BzWSeB6o3YpSb59LqizSkHek"

# Crear cliente
curl -X POST https://xtpqhsbosazgpwmiifjt.supabase.co/functions/v1/server/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0cHFoc2Jvc2F6Z3B3bWlpZmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTkzNDYsImV4cCI6MjA3ODYzNTM0Nn0.CroohNlRTzzoz1IWTG9BzWSeB6o3YpSb59LqizSkHek" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "+54 11 1234-5678",
    "email": "juan@example.com"
  }'
```

### Test desde la Aplicación

Usar la herramienta de diagnóstico integrada:
1. Abrir la aplicación
2. Ir a pestaña "Diagnóstico"
3. Click en "Ejecutar Diagnóstico"

---

## 📊 Modelo de Datos KV

### Estructura de Claves

El sistema usa prefijos para organizar datos:

```
cliente:{id}                   → Datos del cliente
cliente_by_telefono:{telefono} → Índice por teléfono
vehiculo:{id}                  → Datos del vehículo
vehiculo_by_patente:{patente}  → Índice por patente
vehiculos_cliente:{clienteId}  → Lista de vehículos del cliente
admision:{id}                  → Datos de la admisión
admision_by_orden:{numero}     → Índice por número de orden
admisiones_vehiculo:{vehiculoId} → Lista de admisiones del vehículo
trabajo:{id}                   → Datos del trabajo
trabajos_admision:{admisionId} → Lista de trabajos de la admisión
```

### Ejemplo de Valor

```json
{
  "id": "1732012345-abc123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+54 11 1234-5678",
  "email": "juan@example.com",
  "direccion": "Av. Corrientes 1234",
  "ciudad": "Buenos Aires",
  "fecha_creacion": "2025-11-19T12:00:00Z",
  "fecha_actualizacion": "2025-11-19T12:00:00Z"
}
```

---

## 🔒 Seguridad

### Row Level Security (RLS)

El script `setup.sql` configura dos opciones:

**Opción A: Política Permisiva (Desarrollo)**
```sql
CREATE POLICY "Permitir acceso completo a kv_store"
ON kv_store_89b561df FOR ALL
USING (true) WITH CHECK (true);
```

**Opción B: Políticas Granulares (Producción)**
```sql
-- Diferentes políticas para SELECT, INSERT, UPDATE, DELETE
-- Basadas en auth.role()
```

**⚠️ Para producción, cambiar a Opción B**

---

## 📝 Logs

### Ver Logs en Tiempo Real

```bash
supabase functions logs server --follow
```

### Ver Logs Recientes

```bash
supabase functions logs server --limit 100
```

### Filtrar por Nivel

```bash
supabase functions logs server --level error
```

---

## 🐛 Troubleshooting

### Error: "Function not found"

**Causa:** Función no desplegada

**Solución:**
```bash
supabase functions deploy server
```

### Error: "Table does not exist"

**Causa:** Tabla KV no creada

**Solución:**
Ejecutar [`setup.sql`](./setup.sql)

### Error: "Permission denied"

**Causa:** Políticas RLS incorrectas

**Solución:**
```sql
-- Re-crear política permisiva
DROP POLICY IF EXISTS "Permitir acceso completo a kv_store" ON kv_store_89b561df;
CREATE POLICY "Permitir acceso completo a kv_store"
ON kv_store_89b561df FOR ALL
USING (true) WITH CHECK (true);
```

### Error: CORS

**Causa:** CORS mal configurado (raro)

**Solución:**
Verificar líneas 11-20 en `functions/server/index.tsx`

---

## 🔗 Enlaces Útiles

- **Dashboard Principal:** https://supabase.com/dashboard/project/xtpqhsbosazgpwmiifjt
- **SQL Editor:** https://supabase.com/dashboard/project/xtpqhsbosazgpwmiifjt/sql
- **Edge Functions:** https://supabase.com/dashboard/project/xtpqhsbosazgpwmiifjt/functions
- **Table Editor:** https://supabase.com/dashboard/project/xtpqhsbosazgpwmiifjt/editor
- **Logs:** https://supabase.com/dashboard/project/xtpqhsbosazgpwmiifjt/logs/functions

---

## 📚 Documentación Adicional

- **Instrucciones de Deployment:** [`/INSTRUCCIONES_DEPLOYMENT.md`](../INSTRUCCIONES_DEPLOYMENT.md)
- **Solución de Errores:** [`/RESUMEN_SOLUCION.md`](../RESUMEN_SOLUCION.md)
- **Documentación Técnica:** [`/DOCUMENTACION_TECNICA.md`](../DOCUMENTACION_TECNICA.md)
- **README Principal:** [`/README.md`](../README.md)

---

**¿Problemas?** Usa la herramienta de Diagnóstico en la aplicación o consulta [`/INSTRUCCIONES_DEPLOYMENT.md`](../INSTRUCCIONES_DEPLOYMENT.md)
