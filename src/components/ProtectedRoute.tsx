/**
 * Componente de Protección de Rutas
 * 
 * Controla el acceso a secciones según permisos del usuario
 */

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requierePermiso?: string;
  requiereRol?: "administrador" | "recepcionista" | "tecnico";
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requierePermiso,
  requiereRol,
  fallback,
}: ProtectedRouteProps) {
  const { usuario, tienePermiso } = useAuth();

  // Si no hay usuario autenticado
  if (!usuario) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto p-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para acceder a esta sección
            </p>
          </div>
        </div>
      )
    );
  }

  // Verificar rol específico
  if (requiereRol && usuario.rol !== requiereRol) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto p-8 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <p className="text-red-700 mb-2">Acceso denegado</p>
            <p className="text-red-600 text-sm">
              Esta sección requiere el rol de <strong>{requiereRol}</strong>
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Tu rol actual: <strong>{usuario.rol}</strong>
            </p>
          </div>
        </div>
      )
    );
  }

  // Verificar permiso específico
  if (requierePermiso && !tienePermiso(requierePermiso)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto p-8 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <p className="text-amber-700 mb-2">Acceso restringido</p>
            <p className="text-amber-600 text-sm">
              No tienes permisos para acceder a esta funcionalidad
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Permiso requerido: <code className="bg-white px-2 py-1 rounded">{requierePermiso}</code>
            </p>
          </div>
        </div>
      )
    );
  }

  // Si tiene acceso, mostrar contenido
  return <>{children}</>;
}

interface CanProps {
  children: React.ReactNode;
  permiso?: string;
  rol?: "administrador" | "recepcionista" | "tecnico";
  fallback?: React.ReactNode;
}

/**
 * Componente condicional para mostrar/ocultar según permisos
 */
export function Can({ children, permiso, rol, fallback }: CanProps) {
  const { usuario, tienePermiso } = useAuth();

  if (!usuario) {
    return <>{fallback || null}</>;
  }

  if (rol && usuario.rol !== rol) {
    return <>{fallback || null}</>;
  }

  if (permiso && !tienePermiso(permiso)) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}
