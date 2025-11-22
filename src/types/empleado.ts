/**
 * Modelo de Empleado para el Sistema de Gestión de Taller Mecánico
 * 
 * Este archivo define la estructura del modelo de empleado con campos obligatorios,
 * opcionales y extensibilidad para campos personalizados.
 */

// Tipos de estado del empleado
export type EstadoEmpleado = "activo" | "inactivo";

// Roles disponibles (extensible según necesidades del taller)
export type RolEmpleado = 
  | "mecanico" 
  | "electricista" 
  | "chapista" 
  | "pintor" 
  | "gerente" 
  | "administrativo" 
  | "recepcionista"
  | "diagnostico"
  | "jefe_taller"
  | "ayudante"
  | "otro";

/**
 * Interfaz principal del modelo Empleado
 * 
 * Campos obligatorios:
 * - nombre: Nombre del empleado
 * - apellido: Apellido del empleado
 * - rol: Rol dentro del taller
 * - estado: Estado actual (activo/inactivo)
 * - telefono: Contacto principal
 * 
 * Campos opcionales/adicionales:
 * - Información de contacto adicional
 * - Datos personales
 * - Información laboral
 * - campos_adicionales: Para extensibilidad completa
 */
export interface Empleado {
  id: string;
  
  // ============================================
  // CAMPOS OBLIGATORIOS
  // ============================================
  nombre: string;
  apellido: string;
  rol: RolEmpleado;
  estado: EstadoEmpleado;
  telefono: string; // Contacto principal
  
  // ============================================
  // CAMPOS OPCIONALES - Contacto
  // ============================================
  email?: string;
  telefono_secundario?: string;
  
  // ============================================
  // CAMPOS OPCIONALES - Dirección
  // ============================================
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  
  // ============================================
  // CAMPOS OPCIONALES - Documentación
  // ============================================
  tipo_documento?: string;
  numero_documento?: string;
  
  // ============================================
  // CAMPOS OPCIONALES - Información Laboral
  // ============================================
  fecha_ingreso?: string;
  salario?: number;
  especialidad?: string; // Ej: "Motor diesel", "Transmisión automática"
  certificaciones?: string[]; // Certificaciones profesionales
  nivel_experiencia?: "junior" | "semi-senior" | "senior" | "experto";
  
  // ============================================
  // CAMPOS OPCIONALES - Otros
  // ============================================
  notas?: string;
  foto_url?: string;
  
  // ============================================
  // METADATOS
  // ============================================
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
  
  // ============================================
  // EXTENSIBILIDAD - Campos personalizados
  // ============================================
  /**
   * Permite agregar campos adicionales personalizados
   * sin modificar la estructura principal del modelo.
   * 
   * Ejemplo:
   * campos_adicionales: {
   *   turno_preferido: "mañana",
   *   tiene_vehiculo: true,
   *   dias_vacaciones_disponibles: 15
   * }
   */
  campos_adicionales?: Record<string, any>;
}

/**
 * Tipo para crear un nuevo empleado (omitiendo campos autogenerados)
 */
export type NuevoEmpleado = Omit<Empleado, "id" | "fecha_creacion"> & {
  id?: string;
  fecha_creacion?: string;
};

/**
 * Tipo para actualizar un empleado (todos los campos son opcionales excepto el ID)
 */
export type ActualizarEmpleado = Partial<Empleado> & {
  id: string;
};

/**
 * Filtros para búsqueda de empleados
 */
export interface FiltrosEmpleado {
  estado?: EstadoEmpleado;
  rol?: RolEmpleado;
  nombre?: string;
  especialidad?: string;
  ciudad?: string;
}

/**
 * Estadísticas de empleados
 */
export interface EstadisticasEmpleado {
  total: number;
  activos: number;
  inactivos: number;
  por_rol: Record<RolEmpleado, number>;
  nuevos_ultimo_mes: number;
}

/**
 * Constantes y utilidades
 */
export const ROLES_LABELS: Record<RolEmpleado, string> = {
  mecanico: "Mecánico",
  electricista: "Electricista",
  chapista: "Chapista",
  pintor: "Pintor",
  gerente: "Gerente",
  administrativo: "Administrativo",
  recepcionista: "Recepcionista",
  diagnostico: "Diagnóstico",
  jefe_taller: "Jefe de Taller",
  ayudante: "Ayudante",
  otro: "Otro"
};

export const ESTADOS_LABELS: Record<EstadoEmpleado, string> = {
  activo: "Activo",
  inactivo: "Inactivo"
};

/**
 * Función helper para obtener el nombre completo del empleado
 */
export function getNombreCompleto(empleado: Empleado): string {
  return `${empleado.nombre} ${empleado.apellido}`.trim();
}

/**
 * Función helper para verificar si un empleado está activo
 */
export function isEmpleadoActivo(empleado: Empleado): boolean {
  return empleado.estado === "activo";
}

/**
 * Función helper para obtener la etiqueta del rol
 */
export function getRolLabel(rol: RolEmpleado): string {
  return ROLES_LABELS[rol] || rol;
}

/**
 * Función helper para obtener la etiqueta del estado
 */
export function getEstadoLabel(estado: EstadoEmpleado): string {
  return ESTADOS_LABELS[estado] || estado;
}
