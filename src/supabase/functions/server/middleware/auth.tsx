/**
 * Middleware de Autenticación y Autorización
 * 
 * Valida tokens y permisos para las rutas del API
 */

import { Context } from "npm:hono";

// Tipos de roles y permisos
export type Rol = "admin" | "gerente" | "mecanico" | "recepcionista" | "guest";

export interface Usuario {
  id: string;
  email: string;
  rol: Rol;
  nombre: string;
}

// Permisos por rol
const PERMISOS: Record<Rol, string[]> = {
  admin: [
    "empleados:crear",
    "empleados:editar",
    "empleados:eliminar",
    "empleados:ver",
    "empleados:cambiar_estado",
    "clientes:*",
    "vehiculos:*",
    "admisiones:*",
    "trabajos:*",
  ],
  gerente: [
    "empleados:crear",
    "empleados:editar",
    "empleados:ver",
    "empleados:cambiar_estado",
    "clientes:*",
    "vehiculos:*",
    "admisiones:*",
    "trabajos:*",
  ],
  mecanico: [
    "empleados:ver",
    "clientes:ver",
    "vehiculos:ver",
    "admisiones:ver",
    "trabajos:editar",
    "trabajos:ver",
  ],
  recepcionista: [
    "empleados:ver",
    "clientes:*",
    "vehiculos:*",
    "admisiones:crear",
    "admisiones:editar",
    "admisiones:ver",
  ],
  guest: [
    "admisiones:ver",
  ],
};

/**
 * Extrae el token del header Authorization
 */
export function extraerToken(c: Context): string | null {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return null;
  
  // Formato: "Bearer TOKEN"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  
  return parts[1];
}

/**
 * Decodifica y valida un token (simplificado para demo)
 * En producción, usar JWT con firma
 */
export function decodificarToken(token: string): Usuario | null {
  try {
    // Por ahora, aceptamos el token de Supabase anon key para desarrollo
    // En producción, decodificar JWT real
    
    // Token de desarrollo: asignar rol admin por defecto
    // TODO: Implementar validación real de JWT
    return {
      id: "dev-user-123",
      email: "admin@taller.com",
      rol: "admin",
      nombre: "Administrador",
    };
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function tienePermiso(usuario: Usuario, permiso: string): boolean {
  const permisosRol = PERMISOS[usuario.rol] || [];
  
  // Verificar permiso directo
  if (permisosRol.includes(permiso)) {
    return true;
  }
  
  // Verificar wildcard (ej: "clientes:*" permite "clientes:crear", "clientes:editar", etc.)
  const [recurso] = permiso.split(":");
  if (permisosRol.includes(`${recurso}:*`)) {
    return true;
  }
  
  return false;
}

/**
 * Middleware para requerir autenticación
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
  const token = extraerToken(c);
  
  if (!token) {
    return c.json({
      error: "No autorizado",
      message: "Token de autenticación requerido",
      code: "AUTH_TOKEN_MISSING",
    }, 401);
  }
  
  const usuario = decodificarToken(token);
  
  if (!usuario) {
    return c.json({
      error: "No autorizado",
      message: "Token de autenticación inválido o expirado",
      code: "AUTH_TOKEN_INVALID",
    }, 401);
  }
  
  // Agregar usuario al contexto
  c.set("usuario", usuario);
  
  await next();
}

/**
 * Middleware para requerir un permiso específico
 */
export function requirePermiso(permiso: string) {
  return async (c: Context, next: () => Promise<void>) => {
    const usuario = c.get("usuario") as Usuario;
    
    if (!usuario) {
      return c.json({
        error: "No autorizado",
        message: "Debes estar autenticado para realizar esta acción",
        code: "AUTH_REQUIRED",
      }, 401);
    }
    
    if (!tienePermiso(usuario, permiso)) {
      return c.json({
        error: "Prohibido",
        message: `No tienes permisos para: ${permiso}`,
        code: "PERMISSION_DENIED",
        requiredPermission: permiso,
        userRole: usuario.rol,
      }, 403);
    }
    
    await next();
  };
}

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export async function optionalAuth(c: Context, next: () => Promise<void>) {
  const token = extraerToken(c);
  
  if (token) {
    const usuario = decodificarToken(token);
    if (usuario) {
      c.set("usuario", usuario);
    }
  }
  
  await next();
}

/**
 * Helper para obtener el usuario actual del contexto
 */
export function getUsuarioActual(c: Context): Usuario | null {
  return c.get("usuario") || null;
}
