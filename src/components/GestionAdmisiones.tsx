import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  ClipboardCheck,
  Search,
  Wrench,
  Calendar,
  Car,
  User,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  Save,
  Trash2,
  Settings,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";
import { toast } from "sonner";

interface Admision {
  id: string;
  numero_orden: string;
  fecha_ingreso: string;
  hora_ingreso: string;
  estado: string;
  cliente_id: string;
  vehiculo_id: string;
  kilometraje_actual: number;
  nivel_combustible: string;
  prioridad: string;
  motivo_ingreso: string;
  diagnostico_inicial: string;
  observaciones: string;
  necesita_remolque: boolean;
  fecha_remolque: string;
  ubicacion_taller: string;
  responsable: string;
  estimado_dias: number;
  estimado_costo: number;
  garantia: boolean;
  items_personales: string;
  condicion_exterior: string;
  checklist: any;
  created_at: string;
  // Datos relacionados
  cliente?: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
  };
  vehiculo?: {
    marca: string;
    modelo: string;
    año: string;
    patente: string;
    color: string;
  };
}

interface Trabajo {
  id?: string;
  admision_id: string;
  descripcion: string;
  mecanico_asignado: string;
  estado: string;
  fecha_inicio: string;
  fecha_finalizacion: string;
  costo_mano_obra: number;
  costo_repuestos: number;
  tiempo_estimado_horas: number;
  notas: string;
}

interface GestionAdmisionesProps {
  refresh?: number;
}

export function GestionAdmisiones({
  refresh,
}: GestionAdmisionesProps) {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [filteredAdmisiones, setFilteredAdmisiones] = useState<
    Admision[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [prioridadFilter, setPrioridadFilter] =
    useState("todas");
  const [selectedAdmision, setSelectedAdmision] =
    useState<Admision | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Estado para gestión de reparaciones
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [nuevoPrioridad, setNuevoPrioridad] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [loadingTrabajos, setLoadingTrabajos] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  // Estado para nuevo trabajo
  const [nuevoTrabajo, setNuevoTrabajo] = useState<
    Partial<Trabajo>
  >({
    descripcion: "",
    mecanico_asignado: "",
    estado: "pendiente",
    fecha_inicio: "",
    fecha_finalizacion: "",
    costo_mano_obra: 0,
    costo_repuestos: 0,
    tiempo_estimado_horas: 0,
    notas: "",
  });
  const [mostrarFormNuevoTrabajo, setMostrarFormNuevoTrabajo] =
    useState(false);

  useEffect(() => {
    cargarAdmisiones();
  }, [refresh]);

  useEffect(() => {
    aplicarFiltros();
  }, [searchTerm, estadoFilter, prioridadFilter, admisiones]);

  const cargarAdmisiones = async () => {
    setLoading(true);
    setError("");

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/admisiones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar admisiones");
      }

      const data = await response.json();
      setAdmisiones(data.admisiones || []);
    } catch (err: any) {
      console.error("Error al cargar admisiones:", err);
      setError(err.message || "Error al cargar las admisiones");
    } finally {
      setLoading(false);
    }
  };

  const cargarTrabajos = async (admisionId: string) => {
    setLoadingTrabajos(true);
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1`;
      const response = await fetch(
        `${baseUrl}/make-server-89b561df/admisiones/${admisionId}/trabajos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al cargar trabajos");
      }

      const data = await response.json();
      setTrabajos(data.trabajos || []);
    } catch (err: any) {
      console.error("Error al cargar trabajos:", err);
      toast.error("Error al cargar los trabajos");
      setTrabajos([]);
    } finally {
      setLoadingTrabajos(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...admisiones];

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (adm) =>
          adm.numero_orden?.toLowerCase().includes(term) ||
          adm.cliente?.nombre?.toLowerCase().includes(term) ||
          adm.cliente?.apellido?.toLowerCase().includes(term) ||
          adm.vehiculo?.patente?.toLowerCase().includes(term) ||
          adm.vehiculo?.marca?.toLowerCase().includes(term) ||
          adm.vehiculo?.modelo?.toLowerCase().includes(term),
      );
    }

    // Filtro por estado
    if (estadoFilter !== "todos") {
      filtered = filtered.filter(
        (adm) => adm.estado === estadoFilter,
      );
    }

    // Filtro por prioridad
    if (prioridadFilter !== "todas") {
      filtered = filtered.filter(
        (adm) => adm.prioridad === prioridadFilter,
      );
    }

    setFilteredAdmisiones(filtered);
  };

  const abrirGestionReparaciones = (admision: Admision) => {
    setSelectedAdmision(admision);
    setNuevoPrioridad(admision.prioridad);
    setNuevoEstado(admision.estado);
    setSheetOpen(true);
    cargarTrabajos(admision.id);
    setMostrarFormNuevoTrabajo(false);
  };

  const actualizarPrioridad = async () => {
    if (!selectedAdmision) return;

    setSavingChanges(true);
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-89b561df`;
      const response = await fetch(
        `${baseUrl}/admisiones/${selectedAdmision.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ prioridad: nuevoPrioridad }),
        },
      );

      if (!response.ok) {
        throw new Error("Error al actualizar prioridad");
      }

      toast.success("Prioridad actualizada correctamente");
      cargarAdmisiones();
      setSelectedAdmision({
        ...selectedAdmision,
        prioridad: nuevoPrioridad,
      });
    } catch (err: any) {
      console.error("Error:", err);
      toast.error("Error al actualizar la prioridad");
    } finally {
      setSavingChanges(false);
    }
  };

  const actualizarEstado = async () => {
    if (!selectedAdmision) return;

    setSavingChanges(true);
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-89b561df`;
      const response = await fetch(
        `${baseUrl}/admisiones/${selectedAdmision.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        },
      );

      if (!response.ok) {
        throw new Error("Error al actualizar estado");
      }

      toast.success("Estado actualizado correctamente");
      cargarAdmisiones();
      setSelectedAdmision({
        ...selectedAdmision,
        estado: nuevoEstado,
      });
    } catch (err: any) {
      console.error("Error:", err);
      toast.error("Error al actualizar el estado");
    } finally {
      setSavingChanges(false);
    }
  };

  const agregarTrabajo = async () => {
    if (
      !selectedAdmision ||
      !nuevoTrabajo.descripcion ||
      !nuevoTrabajo.mecanico_asignado
    ) {
      toast.error(
        "Complete los campos obligatorios (descripción y mecánico)",
      );
      return;
    }

    setSavingChanges(true);
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-89b561df`;
      const response = await fetch(`${baseUrl}/trabajos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ...nuevoTrabajo,
          admision_id: selectedAdmision.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agregar trabajo");
      }

      toast.success("Trabajo agregado correctamente");
      cargarTrabajos(selectedAdmision.id);
      setNuevoTrabajo({
        descripcion: "",
        mecanico_asignado: "",
        estado: "pendiente",
        fecha_inicio: "",
        fecha_finalizacion: "",
        costo_mano_obra: 0,
        costo_repuestos: 0,
        tiempo_estimado_horas: 0,
        notas: "",
      });
      setMostrarFormNuevoTrabajo(false);
    } catch (err: any) {
      console.error("Error:", err);
      toast.error("Error al agregar el trabajo");
    } finally {
      setSavingChanges(false);
    }
  };

  const actualizarEstadoTrabajo = async (
    trabajoId: string,
    nuevoEstado: string,
  ) => {
    setSavingChanges(true);

    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/server`;

      const response = await fetch(
        `${baseUrl}/make-server-89b561df/trabajos/${trabajoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Error al actualizar estado del trabajo",
        );
      }

      toast.success("Estado del trabajo actualizado");
      if (selectedAdmision) cargarTrabajos(selectedAdmision.id);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al actualizar el estado del trabajo");
    } finally {
      setSavingChanges(false);
    }
  };

  const eliminarTrabajo = async (trabajoId: string) => {
    if (!confirm("¿Está seguro de eliminar este trabajo?"))
      return;

    setSavingChanges(true);
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-89b561df`;
      const response = await fetch(
        `${baseUrl}/trabajos/${trabajoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al eliminar trabajo");
      }

      toast.success("Trabajo eliminado correctamente");
      if (selectedAdmision) {
        cargarTrabajos(selectedAdmision.id);
      }
    } catch (err: any) {
      console.error("Error:", err);
      toast.error("Error al eliminar el trabajo");
    } finally {
      setSavingChanges(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estados: {
      [key: string]: {
        label: string;
        variant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline";
      };
    } = {
      pendiente: { label: "Pendiente", variant: "secondary" },
      diagnostico: {
        label: "En Diagnóstico",
        variant: "default",
      },
      en_reparacion: {
        label: "En Reparación",
        variant: "default",
      },
      listo: { label: "Listo", variant: "outline" },
      entregado: { label: "Entregado", variant: "outline" },
    };

    const config = estados[estado] || {
      label: estado,
      variant: "default",
    };
    return (
      <Badge variant={config.variant}>{config.label}</Badge>
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const prioridades: {
      [key: string]: { label: string; className: string };
    } = {
      baja: {
        label: "Baja",
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      },
      media: {
        label: "Media",
        className:
          "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
      },
      alta: {
        label: "Alta",
        className:
          "bg-orange-500/10 text-orange-700 dark:text-orange-300",
      },
      urgente: {
        label: "Urgente",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-300",
      },
    };

    const config = prioridades[prioridad] || {
      label: prioridad,
      className: "",
    };
    return (
      <Badge className={config.className}>{config.label}</Badge>
    );
  };

  const getEstadoTrabajoIcon = (estado: string) => {
    switch (estado) {
      case "completado":
        return (
          <CheckCircle2 className="size-4 text-green-600" />
        );
      case "en_progreso":
        return <Clock className="size-4 text-blue-600" />;
      case "cancelado":
        return <XCircle className="size-4 text-red-600" />;
      default:
        return (
          <AlertTriangle className="size-4 text-yellow-600" />
        );
    }
  };

  const calcularTotales = () => {
    const totalManoObra = trabajos.reduce(
      (sum, t) => sum + (t.costo_mano_obra || 0),
      0,
    );
    const totalRepuestos = trabajos.reduce(
      (sum, t) => sum + (t.costo_repuestos || 0),
      0,
    );
    const totalHoras = trabajos.reduce(
      (sum, t) => sum + (t.tiempo_estimado_horas || 0),
      0,
    );
    return {
      totalManoObra,
      totalRepuestos,
      totalHoras,
      total: totalManoObra + totalRepuestos,
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-6" />
            Gestión de Admisiones
          </CardTitle>
          <CardDescription>
            Administre las admisiones y sus reparaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por orden, cliente, patente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={estadoFilter}
              onValueChange={setEstadoFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  Todos los estados
                </SelectItem>
                <SelectItem value="pendiente">
                  Pendiente
                </SelectItem>
                <SelectItem value="diagnostico">
                  En Diagnóstico
                </SelectItem>
                <SelectItem value="en_reparacion">
                  En Reparación
                </SelectItem>
                <SelectItem value="listo">Listo</SelectItem>
                <SelectItem value="entregado">
                  Entregado
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={prioridadFilter}
              onValueChange={setPrioridadFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">
                  Todas las prioridades
                </SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="text-xs text-muted-foreground">
                Total
              </div>
              <div className="font-semibold">
                {admisiones.length}
              </div>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <div className="text-xs text-muted-foreground">
                Pendientes
              </div>
              <div className="font-semibold">
                {
                  admisiones.filter(
                    (a) => a.estado === "pendiente",
                  ).length
                }
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <div className="text-xs text-muted-foreground">
                Diagnóstico
              </div>
              <div className="font-semibold">
                {
                  admisiones.filter(
                    (a) => a.estado === "diagnostico",
                  ).length
                }
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <div className="text-xs text-muted-foreground">
                Reparación
              </div>
              <div className="font-semibold">
                {
                  admisiones.filter(
                    (a) => a.estado === "en_reparacion",
                  ).length
                }
              </div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <div className="text-xs text-muted-foreground">
                Listos
              </div>
              <div className="font-semibold">
                {
                  admisiones.filter((a) => a.estado === "listo")
                    .length
                }
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive" />
              <span className="text-sm text-destructive">
                {error}
              </span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando admisiones...
            </div>
          ) : filteredAdmisiones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron admisiones
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead className="text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmisiones.map((admision) => (
                    <TableRow key={admision.id}>
                      <TableCell className="font-medium">
                        #{admision.numero_orden}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="size-3" />
                          {new Date(
                            admision.fecha_ingreso,
                          ).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {admision.hora_ingreso}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {admision.cliente?.nombre}{" "}
                          {admision.cliente?.apellido}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {admision.cliente?.telefono}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {admision.vehiculo?.marca}{" "}
                          {admision.vehiculo?.modelo}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {admision.vehiculo?.patente}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {admision.motivo_ingreso ||
                          "Sin especificar"}
                      </TableCell>
                      <TableCell>
                        {getEstadoBadge(admision.estado)}
                      </TableCell>
                      <TableCell>
                        {getPrioridadBadge(admision.prioridad)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            abrirGestionReparaciones(admision)
                          }
                        >
                          <Wrench className="size-4 mr-1" />
                          Gestionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet de Gestión de Reparaciones */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="size-5" />
              Gestión de Reparaciones - Orden #
              {selectedAdmision?.numero_orden}
            </SheetTitle>
            <SheetDescription>
              Administre las reparaciones, estado y asignaciones
              de esta orden
            </SheetDescription>
          </SheetHeader>

          {selectedAdmision && (
            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
              <div className="space-y-6 mt-6">
                {/* Información del Cliente y Vehículo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="size-4 text-primary" />
                      <span className="text-sm font-medium">
                        Cliente
                      </span>
                    </div>
                    <div className="text-sm">
                      {selectedAdmision.cliente?.nombre}{" "}
                      {selectedAdmision.cliente?.apellido}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedAdmision.cliente?.telefono}
                    </div>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="size-4 text-primary" />
                      <span className="text-sm font-medium">
                        Vehículo
                      </span>
                    </div>
                    <div className="text-sm">
                      {selectedAdmision.vehiculo?.marca}{" "}
                      {selectedAdmision.vehiculo?.modelo}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedAdmision.vehiculo?.patente}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Gestión de Estado y Prioridad */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="size-5" />
                      Estado y Prioridad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Estado de la Orden</Label>
                        <Select
                          value={nuevoEstado}
                          onValueChange={setNuevoEstado}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">
                              Pendiente
                            </SelectItem>
                            <SelectItem value="diagnostico">
                              En Diagnóstico
                            </SelectItem>
                            <SelectItem value="en_reparacion">
                              En Reparación
                            </SelectItem>
                            <SelectItem value="listo">
                              Listo
                            </SelectItem>
                            <SelectItem value="entregado">
                              Entregado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Prioridad</Label>
                        <Select
                          value={nuevoPrioridad}
                          onValueChange={setNuevoPrioridad}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baja">
                              Baja
                            </SelectItem>
                            <SelectItem value="media">
                              Media
                            </SelectItem>
                            <SelectItem value="alta">
                              Alta
                            </SelectItem>
                            <SelectItem value="urgente">
                              Urgente
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={actualizarEstado}
                        disabled={
                          savingChanges ||
                          nuevoEstado ===
                            selectedAdmision.estado
                        }
                        size="sm"
                      >
                        <Save className="size-4 mr-2" />
                        Actualizar Estado
                      </Button>
                      <Button
                        onClick={actualizarPrioridad}
                        disabled={
                          savingChanges ||
                          nuevoPrioridad ===
                            selectedAdmision.prioridad
                        }
                        variant="outline"
                        size="sm"
                      >
                        <Save className="size-4 mr-2" />
                        Actualizar Prioridad
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Lista de Trabajos/Reparaciones */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wrench className="size-5" />
                        Trabajos y Reparaciones
                      </CardTitle>
                      <Button
                        onClick={() =>
                          setMostrarFormNuevoTrabajo(
                            !mostrarFormNuevoTrabajo,
                          )
                        }
                        size="sm"
                      >
                        <Plus className="size-4 mr-2" />
                        Agregar Trabajo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Formulario para nuevo trabajo */}
                    {mostrarFormNuevoTrabajo && (
                      <div className="p-4 bg-secondary/50 rounded-lg border space-y-3">
                        <h4 className="font-medium">
                          Nuevo Trabajo
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-2">
                            <Label>Descripción *</Label>
                            <Textarea
                              value={nuevoTrabajo.descripcion}
                              onChange={(e) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  descripcion: e.target.value,
                                })
                              }
                              placeholder="Ej: Cambio de aceite y filtros"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mecánico Asignado *</Label>
                            <Input
                              value={
                                nuevoTrabajo.mecanico_asignado
                              }
                              onChange={(e) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  mecanico_asignado:
                                    e.target.value,
                                })
                              }
                              placeholder="Nombre del mecánico"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                              value={nuevoTrabajo.estado}
                              onValueChange={(value) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  estado: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">
                                  Pendiente
                                </SelectItem>
                                <SelectItem value="en_progreso">
                                  En Progreso
                                </SelectItem>
                                <SelectItem value="completado">
                                  Completado
                                </SelectItem>
                                <SelectItem value="cancelado">
                                  Cancelado
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Fecha Inicio</Label>
                            <Input
                              type="date"
                              value={nuevoTrabajo.fecha_inicio}
                              onChange={(e) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  fecha_inicio: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fecha Finalización</Label>
                            <Input
                              type="date"
                              value={
                                nuevoTrabajo.fecha_finalizacion
                              }
                              onChange={(e) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  fecha_finalizacion:
                                    e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Costo Mano de Obra</Label>
                            <Input
                              type="number"
                              value={
                                nuevoTrabajo.costo_mano_obra
                              }
                              onChange={(e) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  costo_mano_obra:
                                    parseFloat(
                                      e.target.value,
                                    ) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Costo Repuestos</Label>
                            <Input
                              type="number"
                              value={
                                nuevoTrabajo.costo_repuestos
                              }
                              onChange={(e) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  costo_repuestos:
                                    parseFloat(
                                      e.target.value,
                                    ) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              Tiempo Estimado (horas)
                            </Label>
                            <Input
                              type="number"
                              value={
                                nuevoTrabajo.tiempo_estimado_horas
                              }
                              onChange={(e) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  tiempo_estimado_horas:
                                    parseFloat(
                                      e.target.value,
                                    ) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label>Notas</Label>
                            <Textarea
                              value={nuevoTrabajo.notas}
                              onChange={(e) =>
                                setNuevoTrabajo({
                                  ...nuevoTrabajo,
                                  notas: e.target.value,
                                })
                              }
                              placeholder="Notas adicionales"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={agregarTrabajo}
                            disabled={savingChanges}
                            size="sm"
                          >
                            <Save className="size-4 mr-2" />
                            Guardar Trabajo
                          </Button>
                          <Button
                            onClick={() =>
                              setMostrarFormNuevoTrabajo(false)
                            }
                            variant="outline"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Lista de trabajos */}
                    {loadingTrabajos ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Cargando trabajos...
                      </div>
                    ) : trabajos.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay trabajos registrados para esta
                        orden
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trabajos.map((trabajo) => (
                          <div
                            key={trabajo.id}
                            className="p-4 border rounded-lg space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getEstadoTrabajoIcon(
                                    trabajo.estado,
                                  )}
                                  <h4 className="font-medium">
                                    {trabajo.descripcion}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="size-3" />
                                  <span>
                                    {trabajo.mecanico_asignado}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Select
                                  value={trabajo.estado}
                                  onValueChange={(value) =>
                                    trabajo.id &&
                                    actualizarEstadoTrabajo(
                                      trabajo.id,
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-[140px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendiente">
                                      Pendiente
                                    </SelectItem>
                                    <SelectItem value="en_progreso">
                                      En Progreso
                                    </SelectItem>
                                    <SelectItem value="completado">
                                      Completado
                                    </SelectItem>
                                    <SelectItem value="cancelado">
                                      Cancelado
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    trabajo.id &&
                                    eliminarTrabajo(trabajo.id)
                                  }
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Mano de Obra
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="size-3" />
                                  {trabajo.costo_mano_obra?.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Repuestos
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="size-3" />
                                  {trabajo.costo_repuestos?.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Tiempo Est.
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {
                                    trabajo.tiempo_estimado_horas
                                  }
                                  h
                                </div>
                              </div>
                            </div>

                            {trabajo.fecha_inicio && (
                              <div className="text-xs text-muted-foreground">
                                Inicio:{" "}
                                {new Date(
                                  trabajo.fecha_inicio,
                                ).toLocaleDateString()}
                                {trabajo.fecha_finalizacion &&
                                  ` • Fin: ${new Date(trabajo.fecha_finalizacion).toLocaleDateString()}`}
                              </div>
                            )}

                            {trabajo.notas && (
                              <div className="text-sm text-muted-foreground italic">
                                {trabajo.notas}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Totales */}
                    {trabajos.length > 0 && (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h4 className="font-medium mb-3">
                          Resumen de Costos
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Total Mano de Obra
                            </div>
                            <div className="flex items-center gap-1 font-medium">
                              <DollarSign className="size-3" />
                              {calcularTotales().totalManoObra.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Total Repuestos
                            </div>
                            <div className="flex items-center gap-1 font-medium">
                              <DollarSign className="size-3" />
                              {calcularTotales().totalRepuestos.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Tiempo Total
                            </div>
                            <div className="flex items-center gap-1 font-medium">
                              <Clock className="size-3" />
                              {calcularTotales().totalHoras}h
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Total General
                            </div>
                            <div className="flex items-center gap-1 font-semibold">
                              <DollarSign className="size-3" />
                              {calcularTotales().total.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Información adicional */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Información Adicional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Kilometraje
                        </div>
                        <div>
                          {selectedAdmision.kilometraje_actual?.toLocaleString()}{" "}
                          km
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Combustible
                        </div>
                        <div>
                          {selectedAdmision.nivel_combustible}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Ubicación
                        </div>
                        <div>
                          {selectedAdmision.ubicacion_taller ||
                            "No especificada"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Responsable
                        </div>
                        <div>
                          {selectedAdmision.responsable ||
                            "No asignado"}
                        </div>
                      </div>
                    </div>
                    {selectedAdmision.motivo_ingreso && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Motivo de Ingreso
                          </div>
                          <div className="text-sm">
                            {selectedAdmision.motivo_ingreso}
                          </div>
                        </div>
                      </>
                    )}
                    {selectedAdmision.diagnostico_inicial && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Diagnóstico Inicial
                        </div>
                        <div className="text-sm">
                          {selectedAdmision.diagnostico_inicial}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}