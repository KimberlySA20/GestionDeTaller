/**
 * Formulario de Creación/Edición de Empleados
 * 
 * Con validaciones en tiempo real y campos obligatorios marcados
 */

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Briefcase, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Empleado } from "../types/empleado";
import * as validaciones from "../utils/validaciones/empleado";

interface FormularioEmpleadoProps {
  empleado?: Empleado | null;
  onGuardar: (empleado: Partial<Empleado>) => Promise<void>;
  onCancelar: () => void;
  isOpen: boolean;
}

const ROLES = [
  { value: "mecanico", label: "Mecánico" },
  { value: "electricista", label: "Electricista" },
  { value: "chapista", label: "Chapista" },
  { value: "pintor", label: "Pintor" },
  { value: "gerente", label: "Gerente" },
  { value: "administrativo", label: "Administrativo" },
  { value: "recepcionista", label: "Recepcionista" },
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "jefe_taller", label: "Jefe de Taller" },
  { value: "ayudante", label: "Ayudante" },
  { value: "otro", label: "Otro" },
];

export function FormularioEmpleado({
  empleado,
  onGuardar,
  onCancelar,
  isOpen,
}: FormularioEmpleadoProps) {
  const esEdicion = !!empleado;

  // Estado del formulario
  const [formData, setFormData] = useState<Partial<Empleado>>({
    nombre: "",
    apellido: "",
    rol: "mecanico",
    estado: "activo",
    telefono: "",
    email: "",
    telefono_secundario: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
    tipo_documento: "DNI",
    numero_documento: "",
    fecha_ingreso: "",
    salario: 0,
    especialidad: "",
    nivel_experiencia: "",
    notas: "",
  });

  // Estado de validación
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const [guardando, setGuardando] = useState(false);

  // Cargar datos del empleado si es edición
  useEffect(() => {
    if (empleado) {
      setFormData(empleado);
    } else {
      // Reset form
      setFormData({
        nombre: "",
        apellido: "",
        rol: "mecanico",
        estado: "activo",
        telefono: "",
        email: "",
        telefono_secundario: "",
        direccion: "",
        ciudad: "",
        codigo_postal: "",
        tipo_documento: "DNI",
        numero_documento: "",
        fecha_ingreso: "",
        salario: 0,
        especialidad: "",
        nivel_experiencia: "",
        notas: "",
      });
      setErrores({});
      setTocado({});
    }
  }, [empleado, isOpen]);

  // Validar campo individual
  const validarCampo = (campo: string, valor: any) => {
    const datosValidacion = { ...formData, [campo]: valor };

    switch (campo) {
      case "nombre":
        return validaciones.validarNombre(valor);
      case "apellido":
        return validaciones.validarApellido(valor);
      case "telefono":
        return validaciones.validarTelefono(valor);
      case "email":
        if (valor && valor.trim() !== "") {
          return validaciones.validarEmail(valor);
        }
        return { valido: true, error: "" };
      case "rol":
        return validaciones.validarRol(valor);
      case "estado":
        return validaciones.validarEstado(valor);
      default:
        return { valido: true, error: "" };
    }
  };

  // Manejar cambio de campo
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar en tiempo real si el campo ya fue tocado
    if (tocado[name]) {
      const resultado = validarCampo(name, value);
      setErrores((prev) => ({
        ...prev,
        [name]: resultado.valido ? "" : resultado.error,
      }));
    }
  };

  // Marcar campo como tocado al perder foco
  const handleBlur = (campo: string) => {
    setTocado((prev) => ({ ...prev, [campo]: true }));

    // Validar al perder foco
    const resultado = validarCampo(campo, formData[campo as keyof typeof formData]);
    setErrores((prev) => ({
      ...prev,
      [campo]: resultado.valido ? "" : resultado.error,
    }));
  };

  // Validar todo el formulario
  const validarFormulario = (): boolean => {
    const validacionCompleta = validaciones.validarEmpleadoCompleto(formData);

    if (!validacionCompleta.valido) {
      setErrores(validacionCompleta.errores);
      // Marcar todos los campos como tocados
      const todosTocados: Record<string, boolean> = {};
      Object.keys(validacionCompleta.errores).forEach((campo) => {
        todosTocados[campo] = true;
      });
      setTocado(todosTocados);
      return false;
    }

    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);
    try {
      await onGuardar(formData);
    } catch (error) {
      console.error("Error al guardar empleado:", error);
    } finally {
      setGuardando(false);
    }
  };

  // Verificar si hay errores
  const tieneErrores = Object.values(errores).some((error) => error !== "");
  const camposObligatoriosCompletos =
    formData.nombre &&
    formData.apellido &&
    formData.rol &&
    formData.estado &&
    formData.telefono;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="flex items-center gap-2">
            <User className="w-6 h-6" />
            {esEdicion ? "Editar Empleado" : "Nuevo Empleado"}
          </h2>
          <button
            onClick={onCancelar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Información Personal */}
          <div className="mb-6">
            <h3 className="flex items-center gap-2 mb-4 pb-2 border-b">
              <User className="w-5 h-5" />
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={() => handleBlur("nombre")}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errores.nombre && tocado.nombre
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Juan"
                />
                {errores.nombre && tocado.nombre && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errores.nombre}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block mb-2">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  onBlur={() => handleBlur("apellido")}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errores.apellido && tocado.apellido
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Pérez"
                />
                {errores.apellido && tocado.apellido && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errores.apellido}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    onBlur={() => handleBlur("telefono")}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                      errores.telefono && tocado.telefono
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="11-1234-5678"
                  />
                </div>
                {errores.telefono && tocado.telefono && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errores.telefono}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                      errores.email && tocado.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="juan@taller.com"
                  />
                </div>
                {errores.email && tocado.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errores.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rol y Estado */}
          <div className="mb-6">
            <h3 className="flex items-center gap-2 mb-4 pb-2 border-b">
              <Briefcase className="w-5 h-5" />
              Información Laboral
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rol */}
              <div>
                <label className="block mb-2">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  onBlur={() => handleBlur("rol")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {ROLES.map((rol) => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* Especialidad */}
              <div>
                <label className="block mb-2">Especialidad</label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Transmisión automática"
                />
              </div>

              {/* Fecha de Ingreso */}
              <div>
                <label className="block mb-2">Fecha de Ingreso</label>
                <input
                  type="date"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="mb-6">
            <h3 className="flex items-center gap-2 mb-4 pb-2 border-b">
              <MapPin className="w-5 h-5" />
              Dirección
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-2">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Av. Corrientes 1234"
                />
              </div>

              <div>
                <label className="block mb-2">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Buenos Aires"
                />
              </div>

              <div>
                <label className="block mb-2">Código Postal</label>
                <input
                  type="text"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="C1043"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="mb-6">
            <label className="block mb-2">Notas</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Información adicional..."
            />
          </div>

          {/* Indicador de campos obligatorios */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="text-red-500">*</span> Indica campos obligatorios
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancelar}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || tieneErrores || !camposObligatoriosCompletos}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                guardando || tieneErrores || !camposObligatoriosCompletos
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {guardando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {esEdicion ? "Actualizar" : "Guardar"}
                </>
              )}
            </button>
          </div>

          {/* Mensaje de error general */}
          {tieneErrores && Object.keys(tocado).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Por favor, corrige los errores antes de guardar
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
