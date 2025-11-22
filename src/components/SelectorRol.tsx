/**
 * Selector de Rol (Solo para Desarrollo)
 *
 * Permite cambiar entre roles para probar permisos
 */

import React from "react";
import { useAuth, Usuario, Rol } from "../contexts/AuthContext";
import { Shield, User } from "lucide-react";

const ROLES_DISPONIBLES: {
  rol: Rol;
  nombre: string;
  descripcion: string;
}[] = [
  {
    rol: "administrador",
    nombre: "Administrador",
    descripcion: "Acceso total a toda la aplicación",
  },
  {
    rol: "recepcionista",
    nombre: "Recepcionista",
    descripcion: "Puede crear admisiones y gestionar clientes",
  },
  {
    rol: "tecnico",
    nombre: "Técnico",
    descripcion: "Puede ver y modificar trabajos asignados",
  },
  {
    rol: "guest",
    nombre: "Invitado",
    descripcion: "Solo puede ver admisiones",
  },
];

export function SelectorRol({ onClose }) {
  const { usuario, login } = useAuth();

  const cambiarRol = (nuevoRol: Rol) => {
    const nuevoUsuario: Usuario = {
      id: `dev-user-${nuevoRol}`,
      nombre:
        ROLES_DISPONIBLES.find((r) => r.rol === nuevoRol)
          ?.nombre || nuevoRol,
      email: `${nuevoRol}@taller.com`,
      rol: nuevoRol,
    };
    login(nuevoUsuario);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border-2 border-blue-600 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b">
          <Shield className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">
              Modo Desarrollo
            </p>
            <p>Cambiar Rol</p>
          </div>
        </div>

        {/* Usuario actual */}
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">
            Rol Actual:
          </p>
          <p className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <strong>{usuario?.nombre}</strong>
          </p>
        </div>

        {/* Selector de roles */}
        <div className="space-y-2">
          {ROLES_DISPONIBLES.map((rol) => (
            <button
              key={rol.rol}
              onClick={() => cambiarRol(rol.rol)}
              disabled={usuario?.rol === rol.rol}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                usuario?.rol === rol.rol
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              <p
                className={
                  usuario?.rol === rol.rol
                    ? ""
                    : "text-gray-800"
                }
              >
                {rol.nombre}
              </p>
              <p
                className={`text-xs mt-1 ${
                  usuario?.rol === rol.rol
                    ? "text-blue-100"
                    : "text-gray-600"
                }`}
              >
                {rol.descripcion}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t text-xs text-gray-500 text-center">
          Este selector solo está disponible en modo desarrollo
        </div>
        <button
          className="w-full py-2 bg-gray-300 rounded"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}