/**
 * Lista de Empleados con Activación/Inactivación
 * 
 * Permite gestionar empleados y cambiar su estado con confirmación
 */

import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Edit2,
  Power,
  AlertTriangle,
  X,
  CheckCircle2,
  Search,
  Filter,
} from "lucide-react";
import { Empleado } from "../types/empleado";
import { useAuth } from "../contexts/AuthContext";
import { Can } from "./ProtectedRoute";

interface ListaEmpleadosProps {
  empleados: Empleado[];
  onEditar: (empleado: Empleado) => void;
  onCambiarEstado: (empleado: Empleado, nuevoEstado: "activo" | "inactivo", motivo?: string) => Promise<void>;
  loading?: boolean;
}

export function ListaEmpleados({
  empleados,
  onEditar,
  onCambiarEstado,
  loading = false,
}: ListaEmpleadosProps) {
  const { tienePermiso } = useAuth();

  // Estado de confirmación
  const [empleadoConfirmacion, setEmpleadoConfirmacion] = useState<Empleado | null>(null);
  const [motivoInactivacion, setMotivoInactivacion] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Filtros
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter((emp) => {
    // Filtro por rol
    if (filtroRol !== "todos" && emp.rol !== filtroRol) {
      return false;
    }

    // Filtro por estado
    if (filtroEstado !== "todos" && emp.estado !== filtroEstado) {
      return false;
    }

    // Búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      return (
        emp.nombre.toLowerCase().includes(searchLower) ||
        emp.apellido.toLowerCase().includes(searchLower) ||
        (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
        (emp.telefono && emp.telefono.includes(busqueda))
      );
    }

    return true;
  });

  // Confirmar cambio de estado
  const confirmarCambioEstado = async () => {
    if (!empleadoConfirmacion) return;

    setProcesando(true);
    try {
      const nuevoEstado = empleadoConfirmacion.estado === "activo" ? "inactivo" : "activo";
      await onCambiarEstado(empleadoConfirmacion, nuevoEstado, motivoInactivacion || undefined);
      setEmpleadoConfirmacion(null);
      setMotivoInactivacion("");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setProcesando(false);
    }
  };

  // Roles únicos para el filtro
  const rolesUnicos = Array.from(new Set(empleados.map((emp) => emp.rol)));

  const puedeEditar = tienePermiso("empleados:editar");
  const puedeCambiarEstado = tienePermiso("empleados:cambiar_estado");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="todos">Todos los roles</option>
              {rolesUnicos.map((rol) => (
                <option key={rol} value={rol}>
                  {rol.charAt(0).toUpperCase() + rol.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          {(filtroRol !== "todos" || filtroEstado !== "todos" || busqueda) && (
            <button
              onClick={() => {
                setFiltroRol("todos");
                setFiltroEstado("todos");
                setBusqueda("");
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de empleados */}
      {empleadosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No se encontraron empleados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empleadosFiltrados.map((empleado) => (
            <div
              key={empleado.id}
              className={`border rounded-lg p-4 transition-all ${
                empleado.estado === "inactivo"
                  ? "bg-gray-50 border-gray-300 opacity-75"
                  : "bg-white border-gray-200 hover:shadow-md"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {empleado.nombre} {empleado.apellido}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {empleado.rol.charAt(0).toUpperCase() + empleado.rol.slice(1).replace("_", " ")}
                  </p>
                </div>

                {/* Badge de estado */}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    empleado.estado === "activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {empleado.estado === "activo" ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Contacto */}
              <div className="space-y-2 mb-4">
                {empleado.telefono && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {empleado.telefono}
                  </p>
                )}
                {empleado.email && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {empleado.email}
                  </p>
                )}
                {empleado.especialidad && (
                  <p className="text-sm text-gray-600">
                    <strong>Especialidad:</strong> {empleado.especialidad}
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 pt-3 border-t">
                <Can permiso="empleados:editar">
                  <button
                    onClick={() => onEditar(empleado)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    disabled={empleado.estado === "inactivo" && !puedeEditar}
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                </Can>

                <Can permiso="empleados:cambiar_estado">
                  <button
                    onClick={() => setEmpleadoConfirmacion(empleado)}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      empleado.estado === "activo"
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    title={empleado.estado === "activo" ? "Inactivar" : "Activar"}
                  >
                    <Power className="w-4 h-4" />
                    {empleado.estado === "activo" ? "Inactivar" : "Activar"}
                  </button>
                </Can>
              </div>

              {/* Advertencia si está inactivo */}
              {empleado.estado === "inactivo" && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                  Este empleado no aparecerá en asignaciones futuras
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {empleadoConfirmacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
                <h3>
                  {empleadoConfirmacion.estado === "activo"
                    ? "Inactivar Empleado"
                    : "Activar Empleado"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEmpleadoConfirmacion(null);
                  setMotivoInactivacion("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={procesando}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="mb-4">
                {empleadoConfirmacion.estado === "activo" ? (
                  <>
                    ¿Estás seguro de que deseas inactivar a{" "}
                    <strong>
                      {empleadoConfirmacion.nombre} {empleadoConfirmacion.apellido}
                    </strong>
                    ?
                  </>
                ) : (
                  <>
                    ¿Deseas reactivar a{" "}
                    <strong>
                      {empleadoConfirmacion.nombre} {empleadoConfirmacion.apellido}
                    </strong>
                    ?
                  </>
                )}
              </p>

              {empleadoConfirmacion.estado === "activo" && (
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                    <strong>Nota:</strong> Las órdenes existentes mantendrán la referencia
                    del empleado, pero no aparecerá en asignaciones futuras.
                  </div>

                  <div>
                    <label className="block mb-2">
                      Motivo (opcional)
                    </label>
                    <textarea
                      value={motivoInactivacion}
                      onChange={(e) => setMotivoInactivacion(e.target.value)}
                      placeholder="Ej: Licencia médica, vacaciones, etc."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      disabled={procesando}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setEmpleadoConfirmacion(null);
                  setMotivoInactivacion("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioEstado}
                disabled={procesando}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  procesando
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : empleadoConfirmacion.estado === "activo"
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {procesando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {empleadoConfirmacion.estado === "activo" ? "Inactivar" : "Activar"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}