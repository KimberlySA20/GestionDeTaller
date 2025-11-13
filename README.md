# AutoMecaTech - Sistema de Gestión de Taller Mecánico

Sistema integral para la gestión de clientes, vehículos, servicios y órdenes de trabajo en un taller mecánico.

## Estructura del Proyecto

```
.
├── backend/           # Código del servidor (Node.js/Express)
├── frontend/          # Aplicación web (React)
└── database/          # Scripts de base de datos y migraciones
```

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- MongoDB (local o Atlas)

## Configuración del Entorno

1. Clonar el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd GestionDeTaller
   ```

2. Configurar variables de entorno:
   - Crear un archivo `.env` en la carpeta `backend/` con las siguientes variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/automectech
     JWT_SECRET=tu_clave_secreta
     NODE_ENV=development
     ```

## Instalación y Ejecución

### Backend

1. Instalar dependencias:
   ```bash
   cd backend
   npm install
   ```

2. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   El servidor estará disponible en: `http://localhost:5000`

### Frontend

1. Instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Iniciar la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en: `http://localhost:5173`

## Estructura de la Base de Datos

El sistema utiliza MongoDB con los siguientes modelos principales:

- **Usuarios**: Personal del taller con acceso al sistema
- **Clientes**: Información de los clientes del taller
- **Vehículos**: Vehículos registrados por los clientes
- **Servicios**: Catálogo de servicios ofrecidos
- **Órdenes de Trabajo**: Registro de servicios realizados

## Despliegue

Para desplegar la aplicación en producción, se recomienda:

1. Configurar las variables de entorno de producción
2. Construir el frontend para producción:
   ```bash
   cd frontend
   npm run build
   ```
3. Configurar un servidor web (como Nginx) para servir el frontend
4. Usar PM2 para mantener el servidor Node.js en ejecución

## Licencia

Este proyecto está bajo la licencia MIT.
