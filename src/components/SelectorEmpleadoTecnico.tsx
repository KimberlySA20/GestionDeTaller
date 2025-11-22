/**
 * Selector de Empleado Técnico
 * 
 * Permite seleccionar un empleado técnico disponible para asignar a una reparación
 */

import React, { useState, useEffect } from "react";
import { User, Wrench, AlertCircle, CheckCircle2 } from "lucide-react";
import { Empleado } from "../types/empleado";

const API_URL = "https://xtpqhsbosazgpwmiifjt.supabase.co/functions/v1/make-server-89b561df";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0cHFoc2Jvc2F6Z3B3bWlpZmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MTcxNTAsImV4cCI6MjA0NzA5MzE1MH0.L_5AHLw_Xyra1VPGur0PJV06dEZ1c_zp7PTCn2kkAh0";

interface SelectorEmpleadoTecnicoProps {
  empleadoSeleccionado?: string;
  onChange: (empleadoId: string, empleadoNombre: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  mostrarSoloTecnicos?: boolean;
}

// Roles que se consideran "técnicos"
const ROLES_TECNICOS = [
  "mecanico",
  "electricista",
  "chapista",
  "pintor",
  "diagnostico",
  "jefe_taller",
];

export function SelectorEmpleadoTecnico({
  empleadoSeleccionado,
  onChange,
  disabled = false,
  className = "",
  placeholder = "Seleccionar técnico...",
  mostrarSoloTecnicos = true,
}: SelectorEmpleadoTecnicoProps) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEmpleadosDisponibles();
  }, []);

  const cargarEmpleadosDisponibles = async () => {
    setLoading(true);
    setError("");

    try {
      // Cargar solo empleados activos
      const url = mostrarSoloTecnicos
        ? `${API_URL}/server/empleados?estado=activo`
        : `${API_URL}/server/empleados?estado=activo`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar empleados");
      }

      const data = await response.json();
      let empleadosCargados = data.data?.empleados || data.empleados || [];

      // Filtrar solo técnicos si está habilitado
      if (mostrarSoloTecnicos) {
        empleadosCargados = empleadosCargados.filter((emp: Empleado) =>
          ROLES_TECNICOS.includes(emp.rol)
        );
      }

      setEmpleados(empleadosCargados);
    } catch (err: any) {
      console.error("Error al cargar empleados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empleadoId = e.target.value;
    const empleado = empleados.find((emp) => emp.id === empleadoId);
    const nombreCompleto = empleado
      ? `${empleado.nombre} ${empleado.apellido}`
      : "";
    onChange(empleadoId, nombreCompleto);
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
        <AlertCircle className="w-4 h-4" />
        <span>Error al cargar empleados</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={empleadoSeleccionado || ""}
        onChange={handleChange}
        disabled={disabled || loading}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white ${
          disabled || loading ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <option value="">
          {loading ? "Cargando empleados..." : placeholder}
        </option>
        
        {empleados.map((empleado) => (
          <option key={empleado.id} value={empleado.id}>
            {empleado.nombre} {empleado.apellido} - {empleado.rol.charAt(0).toUpperCase() + empleado.rol.slice(1)}
            {empleado.especialidad ? ` (${empleado.especialidad})` : ""}
          </option>
        ))}
      </select>

      {empleados.length === 0 && !loading && (
        <p className="text-xs text-amber-600 mt-1">
          No hay empleados técnicos disponibles
        </p>
      )}
    </div>
  );
}

/**
 * Card de Empleado Asignado
 * Muestra información detallada del empleado asignado a una reparación
 */
interface EmpleadoAsignadoCardProps {
  empleado: Empleado;
  showEspecialidad?: boolean;
  className?: string;
}

export function EmpleadoAsignadoCard({
  empleado,
  showEspecialidad = true,
  className = "",
}: EmpleadoAsignadoCardProps) {
  return (
    <div
      className={`p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
          {empleado.foto_url ? (
            <img
              src={empleado.foto_url}
              alt={empleado.nombre}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            {empleado.nombre} {empleado.apellido}
          </p>
          <p className="text-sm text-gray-600">
            {empleado.rol.charAt(0).toUpperCase() + empleado.rol.slice(1).replace("_", " ")}
          </p>
          {showEspecialidad && empleado.especialidad && (
            <p className="text-xs text-blue-700 mt-1">
              <Wrench className="w-3 h-3 inline mr-1" />
              {empleado.especialidad}
            </p>
          )}
        </div>

        {empleado.telefono && (
          <a
            href={`tel:${empleado.telefono}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {empleado.telefono}
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Hook para obtener información de un empleado por ID
 */
export function useEmpleado(empleadoId?: string) {
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!empleadoId) {
      setEmpleado(null);
      return;
    }

    const cargarEmpleado = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/server/empleados/${empleadoId}`,
          {
            headers: {
              Authorization: `Bearer ${ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Empleado no encontrado");
        }

        const data = await response.json();
        setEmpleado(data.data?.empleado || data.empleado);
      } catch (err) {
        console.error("Error al cargar empleado:", err);
        setEmpleado(null);
      } finally {
        setLoading(false);
      }
    };

    cargarEmpleado();
  }, [empleadoId]);

  return { empleado, loading };
}
