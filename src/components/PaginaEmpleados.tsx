/**
 * Página Completa de Gestión de Empleados
 * 
 * Integra formulario, lista y gestión de estado
 */

import React, { useState, useEffect } from "react";
import { Users, Plus, AlertCircle } from "lucide-react";
import { FormularioEmpleado } from "./FormularioEmpleado";
import { ListaEmpleados } from "./ListaEmpleados";
import { ProtectedRoute } from "./ProtectedRoute";
import { Empleado } from "../types/empleado";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function PaginaEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado del formulario
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<Empleado | null>(null);

  // Cargar empleados al montar
  useEffect(() => {
    cargarEmpleados();
  }, []);

  // Cargar empleados desde la API
  const cargarEmpleados = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/empleados`, {
        headers: {
          Authorization: `Bearer ${ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar empleados");
      }

      const data = await response.json();
      setEmpleados(data.empleados || []);
    } catch (err: any) {
      console.error("Error al cargar empleados:", err);
      setError(err.message);
      toast.error("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  // Guardar empleado (crear o editar)
  const guardarEmpleado = async (empleadoData: Partial<Empleado>) => {
    try {
      const url = empleadoEditando
        ? `${API_URL}/empleados/${empleadoEditando.id}`
        : `${API_URL}/empleados`;

      const method = empleadoEditando ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(empleadoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar empleado");
      }

      const data = await response.json();

      // Actualizar lista local
      if (empleadoEditando) {
        setEmpleados((prev) =>
          prev.map((emp) =>
            emp.id === empleadoEditando.id ? data.empleado || data.data?.empleado : emp
          )
        );
        toast.success("Empleado actualizado correctamente");
      } else {
        setEmpleados((prev) => [...prev, data.empleado || data.data?.empleado]);
        toast.success("Empleado creado correctamente");
      }

      // Cerrar formulario
      setFormularioAbierto(false);
      setEmpleadoEditando(null);
    } catch (err: any) {
      console.error("Error al guardar empleado:", err);
      toast.error(err.message);
      throw err;
    }
  };

  // Cambiar estado de empleado
  const cambiarEstadoEmpleado = async (
    empleado: Empleado,
    nuevoEstado: "activo" | "inactivo",
    motivo?: string
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/empleados/${empleado.id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({
            estado: nuevoEstado,
            motivo,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cambiar estado");
      }

      const data = await response.json();

      // Actualizar lista local
      setEmpleados((prev) =>
        prev.map((emp) =>
          emp.id === empleado.id ? data.empleado || data.data?.empleado : emp
        )
      );

      toast.success(
        `Empleado ${nuevoEstado === "activo" ? "activado" : "inactivado"} correctamente`
      );
    } catch (err: any) {
      console.error("Error al cambiar estado:", err);
      toast.error(err.message);
      throw err;
    }
  };

  // Abrir formulario para crear
  const abrirFormularioCrear = () => {
    setEmpleadoEditando(null);
    setFormularioAbierto(true);
  };

  // Abrir formulario para editar
  const abrirFormularioEditar = (empleado: Empleado) => {
    setEmpleadoEditando(empleado);
    setFormularioAbierto(true);
  };

  // Cerrar formulario
  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setEmpleadoEditando(null);
  };

  return (
    <ProtectedRoute requierePermiso="empleados:ver">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8" />
              Gestión de Empleados
            </h1>
            <p className="text-gray-600">
              Administra el equipo de trabajo del taller
            </p>
          </div>

          <ProtectedRoute requierePermiso="empleados:crear">
            <button
              onClick={abrirFormularioCrear}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nuevo Empleado
            </button>
          </ProtectedRoute>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
            <p className="text-sm opacity-90">Total Empleados</p>
            <p className="text-3xl mt-1">{empleados.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
            <p className="text-sm opacity-90">Activos</p>
            <p className="text-3xl mt-1">
              {empleados.filter((e) => e.estado === "activo").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-6 rounded-lg shadow">
            <p className="text-sm opacity-90">Inactivos</p>
            <p className="text-3xl mt-1">
              {empleados.filter((e) => e.estado === "inactivo").length}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800">{error}</p>
              <button
                onClick={cargarEmpleados}
                className="text-red-600 hover:text-red-700 text-sm underline mt-1"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Lista de empleados */}
        <ListaEmpleados
          empleados={empleados}
          onEditar={abrirFormularioEditar}
          onCambiarEstado={cambiarEstadoEmpleado}
          loading={loading}
        />

        {/* Formulario */}
        <FormularioEmpleado
          empleado={empleadoEditando}
          onGuardar={guardarEmpleado}
          onCancelar={cerrarFormulario}
          isOpen={formularioAbierto}
        />
      </div>
    </ProtectedRoute>
  );
}
