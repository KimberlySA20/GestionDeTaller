/**
 * Contexto de Autenticación y Permisos
 * 
 * Maneja el estado de autenticación del usuario y sus permisos
 */

import React, { createContext, useContext, useState, useEffect } from "react";

// Tipos de roles
export type Rol = "administrador" | "recepcionista" | "tecnico" | "guest";

// Usuario autenticado
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  empleado_id?: string;
}

// Permisos por rol
const PERMISOS: Record<Rol, string[]> = {
  administrador: [
    "app:*",
    "empleados:*",
    "clientes:*",
    "vehiculos:*",
    "admisiones:*",
    "trabajos:*",
    "estadisticas:*",
  ],
  recepcionista: [
    "clientes:crear",
    "clientes:editar",
    "clientes:ver",
    "vehiculos:crear",
    "vehiculos:editar",
    "vehiculos:ver",
    "admisiones:crear",
    "admisiones:editar",
    "admisiones:ver",
    "trabajos:ver",
    "empleados:ver",
  ],
  tecnico: [
    "admisiones:ver",
    "trabajos:ver",
    "trabajos:editar",
    "trabajos:cambiar_estado",
    "clientes:ver",
    "vehiculos:ver",
  ],
  guest: ["admisiones:ver"],
};

// Estados de trabajo que el técnico puede cambiar
const ESTADOS_PERMITIDOS_TECNICO = [
  "pendiente",
  "diagnostico",
  "en_reparacion",
  "listo", // NO puede cambiar a "entregado"
];

interface AuthContextType {
  usuario: Usuario | null;
  login: (usuario: Usuario) => void;
  logout: () => void;
  tienePermiso: (permiso: string) => boolean;
  puedeAcceder: (seccion: string) => boolean;
  puedeEditarEstado: (estadoActual: string, nuevoEstado: string) => boolean;
  esAdmin: boolean;
  esRecepcionista: boolean;
  esTecnico: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // En desarrollo, empezamos con un usuario administrador
  // En producción, esto vendría de Supabase Auth
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    // Intentar cargar usuario del localStorage
    const stored = localStorage.getItem("usuario");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    
    // Usuario por defecto para desarrollo
    return {
      id: "dev-user-admin",
      nombre: "Administrador",
      email: "admin@taller.com",
      rol: "administrador",
    };
  });

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("usuario");
    }
  }, [usuario]);

  const login = (nuevoUsuario: Usuario) => {
    setUsuario(nuevoUsuario);
  };

  const logout = () => {
    setUsuario(null);
  };

  const tienePermiso = (permiso: string): boolean => {
    if (!usuario) return false;

    const permisosRol = PERMISOS[usuario.rol] || [];

    // Verificar permiso directo
    if (permisosRol.includes(permiso)) {
      return true;
    }

    // Verificar wildcard (ej: "app:*" permite todo)
    if (permisosRol.includes("app:*")) {
      return true;
    }

    // Verificar wildcard por recurso (ej: "empleados:*" permite empleados:crear, empleados:editar, etc.)
    const [recurso] = permiso.split(":");
    if (permisosRol.includes(`${recurso}:*`)) {
      return true;
    }

    return false;
  };

  const puedeAcceder = (seccion: string): boolean => {
    return tienePermiso(`${seccion}:ver`) || tienePermiso(`${seccion}:*`);
  };

  const puedeEditarEstado = (
    estadoActual: string,
    nuevoEstado: string
  ): boolean => {
    if (!usuario) return false;

    // Los administradores pueden cambiar cualquier estado
    if (usuario.rol === "administrador") {
      return true;
    }

    // Los técnicos NO pueden cambiar a "entregado"
    if (usuario.rol === "tecnico") {
      if (nuevoEstado === "entregado") {
        return false;
      }
      // Solo pueden cambiar a estados permitidos
      return ESTADOS_PERMITIDOS_TECNICO.includes(nuevoEstado);
    }

    // Los recepcionistas pueden cambiar a entregado pero no otros estados
    if (usuario.rol === "recepcionista") {
      return nuevoEstado === "entregado" || estadoActual === "pendiente";
    }

    return false;
  };

  const esAdmin = usuario?.rol === "administrador";
  const esRecepcionista = usuario?.rol === "recepcionista";
  const esTecnico = usuario?.rol === "tecnico";

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        tienePermiso,
        puedeAcceder,
        puedeEditarEstado,
        esAdmin,
        esRecepcionista,
        esTecnico,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
