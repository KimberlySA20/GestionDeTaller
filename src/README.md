# 🚗 Sistema de Gestión de Taller Mecánico

Sistema completo para administración de talleres mecánicos profesionales. Permite gestionar ingresos de vehículos, clientes, diagnósticos, reparaciones, inventario y facturación.

## 🔴 IMPORTANTE - PRIMEROS PASOS

**Si ve errores "Failed to fetch"**, debe completar el deployment siguiendo estas instrucciones:

1. **Ejecutar el diagnóstico en la aplicación:**
   - Abrir la aplicación y ir a la pestaña "Diagnóstico"
   - Hacer clic en "Ejecutar Diagnóstico"
   - Revisar qué tests fallan

2. **Configurar la base de datos:**
   - Ver instrucciones detalladas en [`INSTRUCCIONES_DEPLOYMENT.md`](./INSTRUCCIONES_DEPLOYMENT.md)
   - Ejecutar el script SQL en [`/supabase/setup.sql`](./supabase/setup.sql)

3. **Desplegar la Edge Function:**
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref xtpqhsbosazgpwmiifjt
   supabase functions deploy server
   ```

## ✨ Características Principales

- ✅ **Formulario multi-step** para ingreso de vehículos
- 📋 **Checklist de recepción** detallado
- 🔍 **Búsqueda rápida** por patente o número de orden
- 📊 **Dashboard con estadísticas** en tiempo real
- 🔄 **Sistema de estados** para seguimiento de trabajos
- 💾 **Base de datos Supabase** con KV Store
- 🚀 **Deploy automático** con GitHub Actions
- 📱 **Diseño responsive** (desktop, tablet, móvil)

## 🛠️ Stack Tecnológico

- **Frontend:** React 18 + TypeScript
- **UI:** Shadcn/ui + Tailwind CSS v4
- **Backend:** Supabase Edge Functions (Deno + Hono)
- **Base de datos:** Supabase KV Store
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **CI/CD:** GitHub Actions

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- Cuenta de Supabase
- Git

### Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/taller-mecanico.git
cd taller-mecanico
```

### Instalar dependencias

```bash
npm install
```

### Configurar variables de entorno

Este proyecto usa Supabase. Las credenciales ya están configuradas en `/utils/supabase/info.tsx`.

### Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🚀 Deploy

### Deploy Automático con GitHub Actions

1. **Fork este repositorio** en tu cuenta de GitHub

2. **Configurar Secrets** en GitHub:
   - Ve a Settings → Secrets and variables → Actions
   - Agrega los siguientes secrets:

```
VERCEL_TOKEN=tu_token_de_vercel
VERCEL_ORG_ID=tu_org_id_de_vercel
VERCEL_PROJECT_ID=tu_project_id_de_vercel
SUPABASE_PROJECT_REF=tu_project_ref
SUPABASE_ACCESS_TOKEN=tu_access_token
SUPABASE_DB_PASSWORD=tu_db_password
```

3. **Push a main/master** para activar el workflow:

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

El workflow de GitHub Actions se ejecutará automáticamente y desplegará:
- Frontend a Vercel
- Backend (Edge Functions) a Supabase

### Deploy Manual

#### Frontend (Vercel)

```bash
npm run build
vercel --prod
```

#### Backend (Supabase)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy functions
supabase functions deploy server
```

## 📖 Uso del Sistema

### 1. Ingresar un Vehículo

El sistema utiliza un flujo paso a paso de 3 etapas:

#### **Paso 1: Seleccionar o Crear Cliente**
1. Ir a la pestaña **"Ingreso"**
2. **Buscar cliente existente:**
   - Usar el buscador para encontrar por nombre, teléfono o email
   - Click en el cliente para seleccionarlo
3. **O crear nuevo cliente:**
   - Click en "Crear Nuevo"
   - Completar datos (nombre, teléfono obligatorios)
   - Click en "Crear y Continuar"

#### **Paso 2: Seleccionar o Registrar Vehículo**
1. **Seleccionar vehículo existente del cliente:**
   - Se mostrarán todos los vehículos del cliente
   - Click en el vehículo deseado para seleccionarlo
2. **O registrar nuevo vehículo:**
   - Click en "Registrar Nuevo"
   - Completar datos (marca, modelo, patente obligatorios)
   - Click en "Registrar y Continuar"

#### **Paso 3: Completar Datos de Ingreso**
1. Completar **Datos de Ingreso:**
   - Fecha/hora, kilometraje, nivel de combustible
   - Motivo de ingreso, diagnóstico inicial
   - Prioridad, responsable, ubicación en taller
   - Estimaciones de tiempo y costo
2. Completar **Checklist de Recepción:**
   - Marcar herramientas y accesorios presentes
   - Verificar funcionalidades (radio, luces, etc.)
   - Anotar estado físico del vehículo
3. Click en **"Ingresar Vehículo"**

Se generará automáticamente un **número de orden** único.

**Ventajas de este flujo:**
- ✅ Clientes recurrentes no necesitan re-ingresar datos
- ✅ Historial de vehículos por cliente
- ✅ Reutilización de datos de vehículos previos
- ✅ Base de datos limpia sin duplicados

### 2. Ver Vehículos en el Taller

1. Ir a la pestaña **"Vehículos"**
2. Usar el buscador o filtros por estado
3. Ver detalles de cada admisión

### 3. Ver Estadísticas

1. Ir a la pestaña **"Estadísticas"**
2. Ver métricas en tarjetas
3. Analizar gráficos de barras y pie charts

### 4. Buscar por Patente o Orden

Usar los endpoints de búsqueda:

```bash
# Buscar por patente
curl https://{project_id}.supabase.co/functions/v1/server/buscar/patente/ABC123 \
  -H "Authorization: Bearer {publicAnonKey}"

# Buscar por número de orden
curl https://{project_id}.supabase.co/functions/v1/server/buscar/orden/ORD-2025001 \
  -H "Authorization: Bearer {publicAnonKey}"
```

## 🔌 API Endpoints

### Clientes
- `POST /clientes` - Crear cliente
- `GET /clientes` - Listar todos
- `GET /clientes/:id` - Obtener uno
- `PUT /clientes/:id` - Actualizar

### Vehículos
- `POST /vehiculos` - Crear vehículo
- `GET /vehiculos` - Listar todos
- `GET /vehiculos/:id` - Obtener uno
- `GET /clientes/:clienteId/vehiculos` - Vehículos de un cliente
- `PUT /vehiculos/:id` - Actualizar

### Admisiones
- `POST /admisiones` - Crear admisión
- `GET /admisiones` - Listar todas
- `GET /admisiones/:id` - Obtener una
- `PUT /admisiones/:id` - Actualizar
- `PUT /admisiones/:id/estado` - Cambiar estado

### Trabajos
- `POST /trabajos` - Crear trabajo
- `GET /admisiones/:admisionId/trabajos` - Trabajos de una admisión
- `PUT /trabajos/:id` - Actualizar trabajo

### Búsqueda
- `GET /buscar/patente/:patente` - Buscar por patente
- `GET /buscar/orden/:numeroOrden` - Buscar por orden

### Estadísticas
- `GET /estadisticas` - Estadísticas generales

Ver documentación completa en [`DOCUMENTACION_TECNICA.md`](./DOCUMENTACION_TECNICA.md)

## 📂 Estructura del Proyecto

```
/
├── App.tsx                          # Componente principal
├── components/
│   ├── FormularioVehiculo.tsx       # Formulario de ingreso
│   ├── ListaVehiculos.tsx           # Lista de vehículos
│   ├── Estadisticas.tsx             # Dashboard
│   └── ui/                          # Componentes Shadcn
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx            # Servidor Hono
│           └── kv_store.tsx         # Utilidades KV (protegido)
├── utils/
│   └── supabase/
│       └── info.tsx                 # Config Supabase (protegido)
├── .github/
│   └── workflows/
│       └── deploy.yml               # CI/CD GitHub Actions
├── DOCUMENTACION_TECNICA.md         # Documentación completa
└── README.md                        # Este archivo
```

## 🔐 Seguridad

- ✅ Todas las comunicaciones usan HTTPS
- ✅ Autenticación con Supabase
- ✅ Validaciones en frontend y backend
- ✅ CORS configurado correctamente
- ✅ Rate limiting en servidor
- ⚠️ **Importante:** Para producción, implementar autenticación de usuarios y roles

## 🧪 Testing

```bash
# Ejecutar tests (si están disponibles)
npm test

# Ejecutar linter
npm run lint
```

## 📊 Modelo de Datos

### Entidades Principales

1. **Clientes** (`cliente:*`)
   - Información de contacto
   - Historial de vehículos

2. **Vehículos** (`vehiculo:*`)
   - Datos técnicos del vehículo
   - Vinculado a cliente

3. **Admisiones** (`admision:*`)
   - Ingreso del vehículo al taller
   - Estados: pendiente → diagnóstico → en reparación → listo → entregado

4. **Trabajos** (`trabajo:*`)
   - Reparaciones específicas
   - Vinculados a admisión
   - Costo de mano de obra y repuestos

Ver diagrama completo en [`DOCUMENTACION_TECNICA.md`](./DOCUMENTACION_TECNICA.md#3%EF%B8%8F⃣-esquema-de-base-de-datos-relacional)

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Causa:** Problema de conexión con Supabase
**Solución:** Verificar que el servidor Supabase esté corriendo

### Error: "Cliente con este teléfono ya existe"

**Causa:** Validación de duplicados
**Solución:** Usar otro teléfono o buscar el cliente existente

### El workflow de GitHub Actions falla

**Causa:** Secrets no configurados
**Solución:** Verificar que todos los secrets estén en GitHub Settings

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Próximas Funcionalidades

- [ ] Autenticación de usuarios con roles
- [ ] Generación de presupuestos PDF
- [ ] Notificaciones por SMS/Email
- [ ] Upload de fotos del vehículo
- [ ] Gestión de inventario de repuestos
- [ ] Integración con pasarela de pagos
- [ ] App móvil para mecánicos
- [ ] Portal del cliente

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado con ❤️ para talleres mecánicos profesionales

---

**¿Preguntas o sugerencias?** Abre un issue en GitHub

**Documentación completa:** Ver [`DOCUMENTACION_TECNICA.md`](./DOCUMENTACION_TECNICA.md)