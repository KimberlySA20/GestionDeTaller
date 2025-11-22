import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  User,
  Car,
  FileText,
  CheckSquare,
  Wrench,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Clock,
  DollarSign,
  Fuel,
  Settings,
  Shield,
  Package,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";

interface DetalleVehiculoProps {
  admisionId: string;
  onVolver: () => void;
}

interface Admision {
  id: string;
  numero_orden: string;
  vehiculo_id: string;
  cliente_id: string;
  fecha_ingreso: string;
  hora_ingreso: string;
  kilometraje_actual: number;
  nivel_combustible: string;
  prioridad: string;
  estado: string;
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
  fecha_creacion: string;
}

interface Vehiculo {
  id: string;
  cliente_id: string;
  marca: string;
  modelo: string;
  año: string;
  patente: string;
  vin: string;
  color: string;
  tipo_vehiculo: string;
  tipo_combustible: string;
  transmision: string;
  kilometraje: number;
  numero_motor: string;
  numero_chasis: string;
  cilindrada: string;
  categoria: string;
  poliza_seguro: string;
  compañia_seguro: string;
  vencimiento_seguro: string;
  notas: string;
  fecha_creacion: string;
}

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  telefono_secundario: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  tipo_documento: string;
  numero_documento: string;
  notas: string;
  fecha_creacion: string;
}

interface Trabajo {
  id: string;
  admision_id: string;
  descripcion: string;
  tipo: string;
  estado: string;
  mecanico_asignado: string;
  fecha_inicio: string;
  fecha_fin: string;
  horas_trabajadas: number;
  costo_mano_obra: number;
  costo_repuestos: number;
  repuestos_usados: string;
  notas: string;
}

export function DetalleVehiculo({
  admisionId,
  onVolver,
}: DetalleVehiculoProps) {
  const [admision, setAdmision] = useState<Admision | null>(
    null,
  );
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(
    null,
  );
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    cargarDatos();
  }, [admisionId]);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    try {
      // Cargar admisión
      const admisionResponse = await fetch(
        `${baseUrl}/admisiones/${admisionId}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );
      if (!admisionResponse.ok)
        throw new Error("Error al cargar admisión");
      const admisionData = await admisionResponse.json();
      setAdmision(admisionData.admision);

      // Cargar vehículo
      const vehiculoResponse = await fetch(
        `${baseUrl}/vehiculos/${admisionData.admision.vehiculo_id}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );
      if (!vehiculoResponse.ok)
        throw new Error("Error al cargar vehículo");
      const vehiculoData = await vehiculoResponse.json();
      setVehiculo(vehiculoData.vehiculo);

      // Cargar cliente
      const clienteResponse = await fetch(
        `${baseUrl}/clientes/${admisionData.admision.cliente_id}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );
      if (!clienteResponse.ok)
        throw new Error("Error al cargar cliente");
      const clienteData = await clienteResponse.json();
      setCliente(clienteData.cliente);

      // Cargar trabajos
      const trabajosResponse = await fetch(
        `${baseUrl}/admisiones/${admisionId}/trabajos`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );
      if (!trabajosResponse.ok)
        throw new Error("Error al cargar trabajos");
      const trabajosData = await trabajosResponse.json();
      setTrabajos(trabajosData.trabajos || []);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            Cargando información...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !admision || !vehiculo || !cliente) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="size-5" />
            <span>
              Error:{" "}
              {error || "No se pudo cargar la información"}
            </span>
          </div>
          <Button onClick={onVolver} variant="outline">
            <ArrowLeft className="size-4 mr-2" />
            Volver
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const colores: Record<string, string> = {
      pendiente: "bg-yellow-100 text-yellow-800",
      diagnóstico: "bg-blue-100 text-blue-800",
      "espera repuestos": "bg-orange-100 text-orange-800",
      "en reparación": "bg-purple-100 text-purple-800",
      listo: "bg-green-100 text-green-800",
      entregado: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colores[estado] || ""}>
        {estado.toUpperCase()}
      </Badge>
    );
  };

  const checklist = admision.checklist || {};
  const checklistItems = [
    { key: "gato", label: "Gato" },
    { key: "llave_ruedas", label: "Llave de Ruedas" },
    { key: "rueda_auxilio", label: "Rueda de Auxilio" },
    { key: "triangulos", label: "Triángulos" },
    { key: "matafuego", label: "Matafuego" },
    { key: "botiquin", label: "Botiquín" },
    { key: "documentacion", label: "Documentación" },
    { key: "radio_funciona", label: "Radio Funciona" },
    { key: "aire_funciona", label: "A/A Funciona" },
    { key: "luces_funcionan", label: "Luces Funcionan" },
    {
      key: "limpiaparabrisas_funciona",
      label: "Limpiaparabrisas",
    },
    { key: "espejos_completos", label: "Espejos Completos" },
    { key: "tapizado_buen_estado", label: "Tapizado OK" },
    { key: "sin_abolladuras", label: "Sin Abolladuras" },
    { key: "sin_rayones", label: "Sin Rayones" },
  ];

  const costoTotal = trabajos.reduce(
    (sum, t) =>
      sum + (t.costo_mano_obra || 0) + (t.costo_repuestos || 0),
    0,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="size-6" />
                Detalle de Ingreso
              </CardTitle>
              <CardDescription>
                Orden: {admision.numero_orden}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onVolver}>
              <ArrowLeft className="size-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="vehiculo">Vehículo</TabsTrigger>
          <TabsTrigger value="admision">Admisión</TabsTrigger>
          <TabsTrigger value="trabajos">Trabajos</TabsTrigger>
        </TabsList>

        {/* TAB: RESUMEN */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cliente */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <div className="font-semibold">
                    {cliente.nombre} {cliente.apellido}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="size-3" />
                    {cliente.telefono}
                  </div>
                  {cliente.email && (
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Mail className="size-3" />
                      {cliente.email}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vehículo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="size-4" />
                  Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <div className="font-semibold">
                    {vehiculo.marca} {vehiculo.modelo}
                  </div>
                  <div className="text-muted-foreground">
                    Patente: {vehiculo.patente}
                  </div>
                  {vehiculo.año && (
                    <div className="text-muted-foreground">
                      Año: {vehiculo.año}
                    </div>
                  )}
                  {vehiculo.color && (
                    <div className="text-muted-foreground">
                      Color: {vehiculo.color}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estado */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4" />
                  Estado Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="space-y-2">
                  {getEstadoBadge(admision.estado)}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="size-3" />
                    Ingreso: {admision.fecha_ingreso}
                  </div>
                  {admision.prioridad && (
                    <Badge
                      variant={
                        admision.prioridad === "alta"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      Prioridad: {admision.prioridad}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Información de Ingreso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Motivo de Ingreso
                  </div>
                  <div className="mt-1">
                    {admision.motivo_ingreso ||
                      "No especificado"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Diagnóstico Inicial
                  </div>
                  <div className="mt-1">
                    {admision.diagnostico_inicial ||
                      "Pendiente"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Responsable
                  </div>
                  <div className="mt-1">
                    {admision.responsable || "No asignado"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Ubicación en Taller
                  </div>
                  <div className="mt-1">
                    {admision.ubicacion_taller ||
                      "No especificada"}
                  </div>
                </div>
              </div>

              {admision.observaciones && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Observaciones
                  </div>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    {admision.observaciones}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Costos */}
          {trabajos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="size-4" />
                  Costos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Mano de Obra:</span>
                    <span className="font-semibold">
                      $
                      {trabajos
                        .reduce(
                          (sum, t) =>
                            sum + (t.costo_mano_obra || 0),
                          0,
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repuestos:</span>
                    <span className="font-semibold">
                      $
                      {trabajos
                        .reduce(
                          (sum, t) =>
                            sum + (t.costo_repuestos || 0),
                          0,
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">
                      Total:
                    </span>
                    <span className="font-semibold">
                      ${costoTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: CLIENTE */}
        <TabsContent value="cliente">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">
                    Datos Personales
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">
                        Nombre Completo
                      </div>
                      <div className="font-medium">
                        {cliente.nombre} {cliente.apellido}
                      </div>
                    </div>
                    {cliente.tipo_documento && (
                      <div>
                        <div className="text-muted-foreground">
                          {cliente.tipo_documento}
                        </div>
                        <div className="font-medium">
                          {cliente.numero_documento ||
                            "No especificado"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Contacto</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground text-xs">
                          Teléfono Principal
                        </div>
                        <div className="font-medium">
                          {cliente.telefono}
                        </div>
                      </div>
                    </div>
                    {cliente.telefono_secundario && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Teléfono Secundario
                          </div>
                          <div className="font-medium">
                            {cliente.telefono_secundario}
                          </div>
                        </div>
                      </div>
                    )}
                    {cliente.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Email
                          </div>
                          <div className="font-medium">
                            {cliente.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(cliente.direccion || cliente.ciudad) && (
                  <div>
                    <h4 className="font-medium mb-3">
                      Dirección
                    </h4>
                    <div className="space-y-2 text-sm">
                      {cliente.direccion && (
                        <div className="flex items-start gap-2">
                          <MapPin className="size-4 text-muted-foreground mt-0.5" />
                          <div>{cliente.direccion}</div>
                        </div>
                      )}
                      {cliente.ciudad && (
                        <div className="text-muted-foreground">
                          {cliente.ciudad}{" "}
                          {cliente.codigo_postal &&
                            `(${cliente.codigo_postal})`}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {cliente.notas && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-3">Notas</h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {cliente.notas}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: VEHÍCULO */}
        <TabsContent value="vehiculo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="size-5" />
                Información del Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">
                    Datos Básicos
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">
                        Marca y Modelo
                      </div>
                      <div className="font-medium">
                        {vehiculo.marca} {vehiculo.modelo}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-muted-foreground">
                          Año
                        </div>
                        <div className="font-medium">
                          {vehiculo.año || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Patente
                        </div>
                        <div className="font-medium">
                          {vehiculo.patente}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-muted-foreground">
                          Color
                        </div>
                        <div className="font-medium">
                          {vehiculo.color || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Tipo
                        </div>
                        <div className="font-medium">
                          {vehiculo.tipo_vehiculo || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Settings className="size-4" />
                    Especificaciones Técnicas
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-muted-foreground">
                          Combustible
                        </div>
                        <div className="font-medium flex items-center gap-1">
                          <Fuel className="size-3" />
                          {vehiculo.tipo_combustible || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Transmisión
                        </div>
                        <div className="font-medium">
                          {vehiculo.transmision || "N/A"}
                        </div>
                      </div>
                    </div>
                    {vehiculo.cilindrada && (
                      <div>
                        <div className="text-muted-foreground">
                          Cilindrada
                        </div>
                        <div className="font-medium">
                          {vehiculo.cilindrada}
                        </div>
                      </div>
                    )}
                    {vehiculo.kilometraje > 0 && (
                      <div>
                        <div className="text-muted-foreground">
                          Kilometraje
                        </div>
                        <div className="font-medium">
                          {vehiculo.kilometraje.toLocaleString()}{" "}
                          km
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(vehiculo.vin ||
                  vehiculo.numero_motor ||
                  vehiculo.numero_chasis) && (
                  <div>
                    <h4 className="font-medium mb-3">
                      Identificación
                    </h4>
                    <div className="space-y-2 text-sm">
                      {vehiculo.vin && (
                        <div>
                          <div className="text-muted-foreground">
                            VIN/Chasis
                          </div>
                          <div className="font-mono text-xs bg-muted p-2 rounded">
                            {vehiculo.vin}
                          </div>
                        </div>
                      )}
                      {vehiculo.numero_motor && (
                        <div>
                          <div className="text-muted-foreground">
                            Número de Motor
                          </div>
                          <div className="font-mono text-xs bg-muted p-2 rounded">
                            {vehiculo.numero_motor}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(vehiculo.compañia_seguro ||
                  vehiculo.poliza_seguro) && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="size-4" />
                      Seguro
                    </h4>
                    <div className="space-y-2 text-sm">
                      {vehiculo.compañia_seguro && (
                        <div>
                          <div className="text-muted-foreground">
                            Compañía
                          </div>
                          <div className="font-medium">
                            {vehiculo.compañia_seguro}
                          </div>
                        </div>
                      )}
                      {vehiculo.poliza_seguro && (
                        <div>
                          <div className="text-muted-foreground">
                            Póliza
                          </div>
                          <div className="font-medium">
                            {vehiculo.poliza_seguro}
                          </div>
                        </div>
                      )}
                      {vehiculo.vencimiento_seguro && (
                        <div>
                          <div className="text-muted-foreground">
                            Vencimiento
                          </div>
                          <div className="font-medium">
                            {vehiculo.vencimiento_seguro}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {vehiculo.notas && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-3">
                      Notas del Vehículo
                    </h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {vehiculo.notas}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ADMISIÓN */}
        <TabsContent value="admision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Detalles de Admisión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">
                    Información de Ingreso
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground text-xs">
                          Fecha y Hora
                        </div>
                        <div className="font-medium">
                          {admision.fecha_ingreso} -{" "}
                          {admision.hora_ingreso}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Kilometraje Actual
                      </div>
                      <div className="font-medium">
                        {admision.kilometraje_actual.toLocaleString()}{" "}
                        km
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Nivel de Combustible
                      </div>
                      <div className="font-medium flex items-center gap-1">
                        <Fuel className="size-4" />
                        {admision.nivel_combustible}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getEstadoBadge(admision.estado)}
                      <Badge
                        variant={
                          admision.prioridad === "alta"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {admision.prioridad}
                      </Badge>
                      {admision.garantia && (
                        <Badge variant="secondary">
                          Garantía
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">
                    Estimaciones
                  </h4>
                  <div className="space-y-3 text-sm">
                    {admision.estimado_dias > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Días Estimados
                          </div>
                          <div className="font-medium">
                            {admision.estimado_dias} día(s)
                          </div>
                        </div>
                      </div>
                    )}
                    {admision.estimado_costo > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Costo Estimado
                          </div>
                          <div className="font-medium">
                            $
                            {admision.estimado_costo.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                    {admision.responsable && (
                      <div>
                        <div className="text-muted-foreground">
                          Responsable
                        </div>
                        <div className="font-medium">
                          {admision.responsable}
                        </div>
                      </div>
                    )}
                    {admision.ubicacion_taller && (
                      <div>
                        <div className="text-muted-foreground">
                          Ubicación
                        </div>
                        <div className="font-medium">
                          {admision.ubicacion_taller}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {admision.motivo_ingreso && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">
                      Motivo de Ingreso
                    </h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {admision.motivo_ingreso}
                    </div>
                  </div>
                )}

                {admision.diagnostico_inicial && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">
                      Diagnóstico Inicial
                    </h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {admision.diagnostico_inicial}
                    </div>
                  </div>
                )}

                {admision.condicion_exterior && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">
                      Condición Exterior
                    </h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {admision.condicion_exterior}
                    </div>
                  </div>
                )}

                {admision.items_personales && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">
                      Ítems Personales
                    </h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {admision.items_personales}
                    </div>
                  </div>
                )}

                {admision.observaciones && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">
                      Observaciones
                    </h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {admision.observaciones}
                    </div>
                  </div>
                )}

                {admision.necesita_remolque && (
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertCircle className="size-5 text-orange-600" />
                      <div className="text-sm">
                        <div className="font-medium text-orange-900">
                          Requiere Remolque
                        </div>
                        {admision.fecha_remolque && (
                          <div className="text-orange-700">
                            Fecha: {admision.fecha_remolque}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="size-5" />
                Checklist de Recepción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {checklistItems.map((item) => (
                  <div
                    key={item.key}
                    className={`p-3 rounded-lg border ${
                      checklist[item.key]
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-4 rounded border-2 flex items-center justify-center ${
                          checklist[item.key]
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {checklist[item.key] && (
                          <CheckSquare className="size-3 text-white" />
                        )}
                      </div>
                      <span className="text-xs">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TRABAJOS */}
        <TabsContent value="trabajos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="size-5" />
                Trabajos Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trabajos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="size-12 mx-auto mb-3 opacity-50" />
                  <p>
                    No hay trabajos registrados para esta
                    admisión
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trabajos.map((trabajo) => (
                    <Card key={trabajo.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {trabajo.descripcion}
                              </h4>
                              <div className="text-sm text-muted-foreground mt-1">
                                Tipo: {trabajo.tipo}
                              </div>
                            </div>
                            <Badge>{trabajo.estado}</Badge>
                          </div>

                          {trabajo.mecanico_asignado && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Mecánico:
                              </span>{" "}
                              {trabajo.mecanico_asignado}
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {trabajo.fecha_inicio && (
                              <div>
                                <div className="text-muted-foreground">
                                  Inicio
                                </div>
                                <div>
                                  {trabajo.fecha_inicio}
                                </div>
                              </div>
                            )}
                            {trabajo.fecha_fin && (
                              <div>
                                <div className="text-muted-foreground">
                                  Fin
                                </div>
                                <div>{trabajo.fecha_fin}</div>
                              </div>
                            )}
                            {trabajo.horas_trabajadas > 0 && (
                              <div>
                                <div className="text-muted-foreground">
                                  Horas
                                </div>
                                <div>
                                  {trabajo.horas_trabajadas}h
                                </div>
                              </div>
                            )}
                          </div>

                          <Separator />

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Mano de Obra
                              </div>
                              <div className="font-semibold">
                                $
                                {(
                                  trabajo.costo_mano_obra || 0
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Repuestos
                              </div>
                              <div className="font-semibold">
                                $
                                {(
                                  trabajo.costo_repuestos || 0
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {trabajo.repuestos_usados && (
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Repuestos Usados
                              </div>
                              <div className="text-sm mt-1 p-2 bg-muted rounded">
                                {trabajo.repuestos_usados}
                              </div>
                            </div>
                          )}

                          {trabajo.notas && (
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Notas
                              </div>
                              <div className="text-sm mt-1 p-2 bg-muted rounded">
                                {trabajo.notas}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Total */}
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          Total de Trabajos:
                        </span>
                        <span className="text-2xl font-bold">
                          ${costoTotal.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}