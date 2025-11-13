---
trigger: always_on
---

# Estructura del Proyecto AutoMecaTech

Este documento describe la estructura de carpetas y archivos del proyecto AutoMecaTech, incluyendo el backend, frontend y la base de datos.

## Backend (Node.js/Express)

```
backend/
├── src/
│   ├── config/               # Configuraciones de la aplicación
│   │   ├── db.js             # Configuración de la base de datos
│   │   └── config.js         # Otras configuraciones
│   │
│   ├── controllers/          # Controladores de la API
│   │   ├── auth.controller.js
│   │   ├── clientes.controller.js
│   │   ├── vehiculos.controller.js
│   │   ├── servicios.controller.js
│   │   └── ordenes.controller.js
│   │
│   ├── models/               # Modelos de Mongoose
│   │   ├── usuario.model.js
│   │   ├── cliente.model.js
│   │   ├── vehiculo.model.js
│   │   ├── servicio.model.js
│   │   └── orden.model.js
│   │
│   ├── routes/               # Rutas de la API
│   │   ├── auth.routes.js
│   │   ├── clientes.routes.js
│   │   ├── vehiculos.routes.js
│   │   ├── servicios.routes.js
│   │   └── ordenes.routes.js
│   │
│   ├── middleware/           # Middlewares personalizados
│   │   ├── auth.js           # Autenticación JWT
│   │   └── validators.js     # Validación de datos
│   │
│   ├── services/             # Lógica de negocio
│   │   └── *.service.js      # Servicios específicos
│   │
│   ├── utils/                # Utilidades y helpers
│   │   ├── logger.js
│   │   └── errorHandler.js
│   │
│   ├── app.js                # Configuración de Express
│   └── server.js             # Punto de entrada de la aplicación
│
├── tests/                    # Pruebas unitarias y de integración
├── .env                      # Variables de entorno
├── .gitignore
└── package.json
```

## Frontend (React/Redux)

```
frontend/
├── public/                   # Archivos estáticos
│   ├── index.html
│   └── assets/
│       ├── images/           # Imágenes
│       └── fonts/            # Fuentes personalizadas
│
├── src/
│   ├── assets/               # Recursos estáticos
│   │   ├── icons/
│   │   └── styles/
│   │
│   ├── components/           # Componentes reutilizables
│   │   ├── common/           # Componentes comunes (Button, Input, etc.)
│   │   ├── layout/           # Componentes de diseño (Header, Sidebar, etc.)
│   │   └── ui/               # Componentes de interfaz de usuario
│   │
│   ├── features/             # Características organizadas por dominio
│   │   ├── auth/             # Autenticación
│   │   ├── clientes/         # Gestión de clientes
│   │   ├── vehiculos/        # Gestión de vehículos
│   │   ├── servicios/        # Gestión de servicios
│   │   ├── ordenes/          # Gestión de órdenes
│   │   └── reportes/         # Generación de reportes
│   │
│   ├── hooks/                # Custom hooks
│   │
│   ├── lib/                  # Utilidades y configuraciones
│   │   ├── api/              # Configuración de API
│   │   └── utils/            # Funciones de utilidad
│   │
│   ├── pages/                # Componentes de página
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Clientes/
│   │   ├── Vehiculos/
│   │   ├── Servicios/
│   │   ├── Ordenes/
│   │   └── Reportes/
│   │
│   ├── store/                # Gestión de estado (Redux)
│   │   ├── slices/           # Slices de Redux
│   │   └── store.js          # Configuración del store
│   │
│   ├── styles/               # Estilos globales
│   │   ├── theme.js          # Tema de la aplicación
│   │   └── GlobalStyle.js    # Estilos globales
│   │
│   ├── App.jsx               # Componente raíz
│   └── main.jsx              # Punto de entrada
│
├── .env
├── .gitignore
├── package.json
└── vite.config.js
```

## Base de Datos (MongoDB)

```
database/
├── migrations/       # Scripts de migración
│   ├── 001-initial-schema.js
│   └── 002-add-indexes.js
│
├── seeders/          # Datos iniciales
│   ├── usuarios.seeder.js
│   ├── servicios.seeder.js
│   └── index.js
│
└── models/           # Modelos de base de datos (opcional, se pueden mantener solo en backend)
    ├── index.js      # Conexión y configuración
    ├── Usuario.js
    ├── Cliente.js
    ├── Vehiculo.js
    ├── Servicio.js
    └── OrdenServicio.js
```

## Estructura de la Base de Datos

### Usuarios
```javascript
{
  _id: ObjectId,
  nombre: String,
  email: { type: String, unique: true },
  password: String,
  rol: { type: String, enum: ['admin', 'mecanico', 'recepcionista'] },
  activo: Boolean,
  fechaCreacion: Date,
  ultimoAcceso: Date
}
```

### Clientes
```javascript
{
  _id: ObjectId,
  nombre: String,
  apellidos: String,
  email: { type: String, unique: true },
  telefono: String,
  direccion: {
    calle: String,
    ciudad: String,
    estado: String,
    codigoPostal: String
  },
  fechaRegistro: Date,
  notas: String
}
```

### Vehículos
```javascript
{
  _id: ObjectId,
  cliente: { type: ObjectId, ref: 'Cliente' },
  marca: String,
  modelo: String,
  año: Number,
  placa: { type: String, unique: true },
  vin: { type: String, unique: true },
  color: String,
  kilometraje: Number,
  historialServicios: [{
    fecha: Date,
    descripcion: String,
    kilometraje: Number,
    ordenServicio: { type: ObjectId, ref: 'OrdenServicio' }
  }]
}
```

### Servicios
```javascript
{
  _id: ObjectId,
  nombre: String,
  descripcion: String,
  duracion: Number, // en minutos
  precio: Number,
  categoria: String,
  activo: Boolean
}
```

### Órdenes de Trabajo
```javascript
{
  _id: ObjectId,
  cliente: { type: ObjectId, ref: 'Cliente' },
  vehiculo: { type: ObjectId, ref: 'Vehiculo' },
  servicios: [{
    servicio: { type: ObjectId, ref: 'Servicio' },
    cantidad: Number,
    precioUnitario: Number,
    descuento: { type: Number, default: 0 },
    notas: String
  }],
  fechaCreacion: Date,
  fechaEntrega: Date,
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_proceso', 'completada', 'entregada', 'cancelada'],
    default: 'pendiente'
  },
  notas: String,
  total: Number,
  anticipo: { type: Number, default: 0 },
  saldoPendiente: Number,
  facturada: { type: Boolean, default: false },
  creadoPor: { type: ObjectId, ref: 'Usuario' },
  actualizadoPor: { type: ObjectId, ref: 'Usuario' },
  fechaActualizacion: Date
}
```

## Relaciones Principales

1. **Cliente - Vehículo**: Uno a muchos (Un cliente puede tener múltiples vehículos)
2. **Vehículo - OrdenServicio**: Uno a muchos (Un vehículo puede tener múltiples órdenes de servicio)
3. **OrdenServicio - Servicio**: Muchos a muchos (Una orden puede tener múltiples servicios y un servicio puede estar en múltiples órdenes)
4. **Usuario - OrdenServicio**: Uno a muchos (Un usuario puede crear múltiples órdenes de servicio)

## Índices Recomendados

1. **Usuarios**: email (único)
2. **Clientes**: email (único), teléfono
3. **Vehículos**: placa (única), VIN (único), cliente
4. **Servicios**: nombre (para búsquedas)
5. **Órdenes**: cliente, vehículo, fechaCreacion, estado
