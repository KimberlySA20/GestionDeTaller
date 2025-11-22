/**
 * Componente de Gestión de Empleados
 * 
 * Demuestra el uso completo del modelo de empleado con:
 * - Listado de empleados
 * - Búsqueda y filtrado
 * - Creación de nuevos empleados
 * - Visualización de detalles
 */

import { useState, useEffect } from "react";
import { SelectorEmpleado } from "./SelectorEmpleado";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Empleado, 
  EstadoEmpleado, 
  RolEmpleado,
  getNombreCompleto,
  getRolLabel,
  getEstadoLabel 
} from "../types/empleado";
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function GestionEmpleados() {
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoEmpleado | "todos">("todos");
  const [filtroRol, setFiltroRol] = useState<RolEmpleado | "todos">("todos");
  
  // Estadísticas de ejemplo
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
  });

  const handleEmpleadoSeleccionado = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setMostrarSelector(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="size-8" />
            Gestión de Empleados
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra el personal del taller mecánico
          </p>
        </div>
        <Button onClick={() => setMostrarSelector(true)} size="lg">
          <Plus className="size-4 mr-2" />
          Agregar Empleado
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Empleados</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal registrado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Empleados Activos</CardTitle>
            <UserCheck className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.activos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trabajando actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Empleados Inactivos</CardTitle>
            <UserX className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {estadisticas.inactivos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtra empleados por estado y rol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Filtrar por Estado
              </label>
              <Select
                value={filtroEstado}
                onValueChange={(value) => setFiltroEstado(value as EstadoEmpleado | "todos")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Filtrar por Rol
              </label>
              <Select
                value={filtroRol}
                onValueChange={(value) => setFiltroRol(value as RolEmpleado | "todos")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="mecanico">Mecánico</SelectItem>
                  <SelectItem value="electricista">Electricista</SelectItem>
                  <SelectItem value="chapista">Chapista</SelectItem>
                  <SelectItem value="pintor">Pintor</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selector/Creador de Empleado (Modal) */}
      {mostrarSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex justify-between items-center">
              <h2 className="flex items-center gap-2">
                <Users className="size-6" />
                Seleccionar o Crear Empleado
              </h2>
              <Button
                variant="ghost"
                onClick={() => setMostrarSelector(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <SelectorEmpleado
                onEmpleadoSeleccionado={handleEmpleadoSeleccionado}
                filtrarPorEstado={filtroEstado !== "todos" ? filtroEstado : undefined}
                filtrarPorRol={filtroRol !== "todos" ? filtroRol : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detalle del Empleado Seleccionado */}
      {empleadoSeleccionado && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-6" />
                  {getNombreCompleto(empleadoSeleccionado)}
                </CardTitle>
                <CardDescription className="mt-1">
                  Detalles del empleado seleccionado
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={empleadoSeleccionado.estado === "activo" ? "default" : "secondary"}>
                  {getEstadoLabel(empleadoSeleccionado.estado)}
                </Badge>
                <Badge variant="outline">
                  {getRolLabel(empleadoSeleccionado.rol)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información de Contacto */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Phone className="size-4" />
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Teléfono:</span>
                  <p className="font-medium">{empleadoSeleccionado.telefono}</p>
                </div>
                {empleadoSeleccionado.telefono_secundario && (
                  <div>
                    <span className="text-muted-foreground">Teléfono Secundario:</span>
                    <p className="font-medium">{empleadoSeleccionado.telefono_secundario}</p>
                  </div>
                )}
                {empleadoSeleccionado.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{empleadoSeleccionado.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información Laboral */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="size-4" />
                Información Laboral
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Rol:</span>
                  <p className="font-medium">{getRolLabel(empleadoSeleccionado.rol)}</p>
                </div>
                {empleadoSeleccionado.especialidad && (
                  <div>
                    <span className="text-muted-foreground">Especialidad:</span>
                    <p className="font-medium">{empleadoSeleccionado.especialidad}</p>
                  </div>
                )}
                {empleadoSeleccionado.fecha_ingreso && (
                  <div>
                    <span className="text-muted-foreground">Fecha de Ingreso:</span>
                    <p className="font-medium">
                      {new Date(empleadoSeleccionado.fecha_ingreso).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dirección */}
            {(empleadoSeleccionado.direccion || empleadoSeleccionado.ciudad) && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="size-4" />
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {empleadoSeleccionado.direccion && (
                    <div>
                      <span className="text-muted-foreground">Dirección:</span>
                      <p className="font-medium">{empleadoSeleccionado.direccion}</p>
                    </div>
                  )}
                  {empleadoSeleccionado.ciudad && (
                    <div>
                      <span className="text-muted-foreground">Ciudad:</span>
                      <p className="font-medium">{empleadoSeleccionado.ciudad}</p>
                    </div>
                  )}
                  {empleadoSeleccionado.codigo_postal && (
                    <div>
                      <span className="text-muted-foreground">Código Postal:</span>
                      <p className="font-medium">{empleadoSeleccionado.codigo_postal}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notas */}
            {empleadoSeleccionado.notas && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="size-4" />
                  Notas
                </h3>
                <p className="text-sm text-muted-foreground">
                  {empleadoSeleccionado.notas}
                </p>
              </div>
            )}

            {/* Metadatos */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span>Fecha de Creación:</span>
                  <p>{new Date(empleadoSeleccionado.fecha_creacion).toLocaleString()}</p>
                </div>
                {empleadoSeleccionado.fecha_actualizacion && (
                  <div>
                    <span>Última Actualización:</span>
                    <p>{new Date(empleadoSeleccionado.fecha_actualizacion).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
