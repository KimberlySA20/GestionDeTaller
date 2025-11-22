import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Search,
  Car,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";
import { DetalleVehiculo } from "./DetalleVehiculo";

interface Admision {
  id: string;
  numero_orden: string;
  vehiculo_id: string;
  cliente_id: string;
  fecha_ingreso: string;
  estado: string;
  prioridad: string;
  motivo_ingreso: string;
  estimado_dias: number;
  fecha_creacion: string;
}

interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  año: string;
  patente: string;
  color: string;
}

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

export function ListaVehiculos({
  refresh,
}: {
  refresh?: number;
}) {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [vehiculos, setVehiculos] = useState<
    Record<string, Vehiculo>
  >({});
  const [clientes, setClientes] = useState<
    Record<string, Cliente>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [admisionSeleccionada, setAdmisionSeleccionada] =
    useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    cargarDatos();
  }, [refresh]);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    try {
      // Obtener admisiones
      const admisionesResponse = await fetch(
        `${baseUrl}/admisiones`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );
      if (!admisionesResponse.ok)
        throw new Error("Error al cargar admisiones");
      const admisionesData = await admisionesResponse.json();

      // Obtener vehículos
      const vehiculosResponse = await fetch(
        `${baseUrl}/vehiculos`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );
      if (!vehiculosResponse.ok)
        throw new Error("Error al cargar vehículos");
      const vehiculosData = await vehiculosResponse.json();

      // Obtener clientes
      const clientesResponse = await fetch(
        `${baseUrl}/clientes`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );
      if (!clientesResponse.ok)
        throw new Error("Error al cargar clientes");
      const clientesData = await clientesResponse.json();

      // Crear mapas para acceso rápido
      const vehiculosMap: Record<string, Vehiculo> = {};
      vehiculosData.vehiculos.forEach((v: Vehiculo) => {
        vehiculosMap[v.id] = v;
      });

      const clientesMap: Record<string, Cliente> = {};
      clientesData.clientes.forEach((c: Cliente) => {
        clientesMap[c.id] = c;
      });

      setAdmisiones(
        admisionesData.admisiones.sort(
          (a: Admision, b: Admision) =>
            new Date(b.fecha_creacion).getTime() -
            new Date(a.fecha_creacion).getTime(),
        ),
      );
      setVehiculos(vehiculosMap);
      setClientes(clientesMap);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Si hay una admisión seleccionada, mostrar el detalle
  if (admisionSeleccionada) {
    return (
      <DetalleVehiculo
        admisionId={admisionSeleccionada}
        onVolver={() => setAdmisionSeleccionada(null)}
      />
    );
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<
      string,
      {
        variant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline";
        icon: any;
      }
    > = {
      pendiente: { variant: "secondary", icon: Clock },
      diagnóstico: { variant: "default", icon: Search },
      "espera repuestos": { variant: "outline", icon: Package },
      "en reparación": { variant: "default", icon: Car },
      listo: { variant: "default", icon: CheckCircle },
      entregado: { variant: "secondary", icon: CheckCircle },
    };
    const config = estados[estado] || {
      variant: "default" as const,
      icon: AlertCircle,
    };
    const Icon = config.icon;
    return (
      <Badge
        variant={config.variant}
        className="flex items-center gap-1"
      >
        <Icon className="size-3" />
        {estado}
      </Badge>
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const prioridades: Record<
      string,
      "default" | "secondary" | "destructive"
    > = {
      baja: "secondary",
      media: "default",
      alta: "destructive",
    };
    return (
      <Badge variant={prioridades[prioridad] || "default"}>
        {prioridad}
      </Badge>
    );
  };

  const admisionesFiltradas = admisiones.filter((admision) => {
    const vehiculo = vehiculos[admision.vehiculo_id];
    const cliente = clientes[admision.cliente_id];

    const cumpleEstado =
      filterEstado === "todos" ||
      admision.estado === filterEstado;
    const cumpleBusqueda =
      !searchTerm ||
      admision.numero_orden
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      vehiculo?.patente
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      vehiculo?.marca
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      vehiculo?.modelo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cliente?.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cliente?.apellido
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return cumpleEstado && cumpleBusqueda;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            Cargando vehículos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="size-5" />
            <span>Error: {error}</span>
          </div>
          <Button onClick={cargarDatos} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vehículos en el Taller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por orden, patente, marca, modelo o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={
                  filterEstado === "todos"
                    ? "default"
                    : "outline"
                }
                onClick={() => setFilterEstado("todos")}
              >
                Todos
              </Button>
              <Button
                variant={
                  filterEstado === "pendiente"
                    ? "default"
                    : "outline"
                }
                onClick={() => setFilterEstado("pendiente")}
              >
                Pendientes
              </Button>
              <Button
                variant={
                  filterEstado === "en reparación"
                    ? "default"
                    : "outline"
                }
                onClick={() => setFilterEstado("en reparación")}
              >
                En Reparación
              </Button>
              <Button
                variant={
                  filterEstado === "listo"
                    ? "default"
                    : "outline"
                }
                onClick={() => setFilterEstado("listo")}
              >
                Listos
              </Button>
            </div>
          </div>

          {admisionesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron vehículos
            </div>
          ) : (
            <div className="space-y-3">
              {admisionesFiltradas.map((admision) => {
                const vehiculo =
                  vehiculos[admision.vehiculo_id];
                const cliente = clientes[admision.cliente_id];

                if (!vehiculo || !cliente) return null;

                return (
                  <Card
                    key={admision.id}
                    className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary"
                    onClick={() =>
                      setAdmisionSeleccionada(admision.id)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Car className="size-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">
                                {vehiculo.marca}{" "}
                                {vehiculo.modelo}
                              </h3>
                              <Badge variant="outline">
                                {vehiculo.patente}
                              </Badge>
                              {vehiculo.año && (
                                <span className="text-sm text-muted-foreground">
                                  ({vehiculo.año})
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>
                                Cliente: {cliente.nombre}{" "}
                                {cliente.apellido}
                              </div>
                              <div>
                                Teléfono: {cliente.telefono}
                              </div>
                              <div>
                                Orden: {admision.numero_orden}
                              </div>
                              {admision.motivo_ingreso && (
                                <div className="mt-1">
                                  Motivo:{" "}
                                  {admision.motivo_ingreso}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            {getEstadoBadge(admision.estado)}
                            {getPrioridadBadge(
                              admision.prioridad,
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="size-4" />
                            {admision.fecha_ingreso}
                          </div>
                          {admision.estimado_dias > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Estimado: {admision.estimado_dias}{" "}
                              día
                              {admision.estimado_dias !== 1
                                ? "s"
                                : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}