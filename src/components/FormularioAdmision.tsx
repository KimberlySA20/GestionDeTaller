import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  FileText,
  CheckSquare,
  AlertCircle,
  ArrowLeft,
  User,
  Car,
} from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ciudad: string;
}

interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  año: string;
  patente: string;
  color: string;
}

interface FormularioAdmisionProps {
  cliente: Cliente;
  vehiculo: Vehiculo;
  onVolver: () => void;
  onSuccess?: () => void;
}

export function FormularioAdmision({
  cliente,
  vehiculo,
  onVolver,
  onSuccess,
}: FormularioAdmisionProps) {
  const [currentTab, setCurrentTab] = useState("ingreso");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado del formulario - Admisión
  const [admision, setAdmision] = useState({
    fecha_ingreso: new Date().toISOString().split("T")[0],
    hora_ingreso: new Date().toTimeString().substring(0, 5),
    kilometraje_actual: "",
    nivel_combustible: "1/2",
    prioridad: "media",
    motivo_ingreso: "",
    diagnostico_inicial: "",
    observaciones: "",
    necesita_remolque: false,
    fecha_remolque: "",
    ubicacion_taller: "",
    responsable: "",
    estimado_dias: "",
    estimado_costo: "",
    garantia: false,
    items_personales: "",
    condicion_exterior: "",
  });

  // Checklist de recepción
  const [checklist, setChecklist] = useState({
    gato: false,
    llave_ruedas: false,
    rueda_auxilio: false,
    triangulos: false,
    matafuego: false,
    botiquin: false,
    documentacion: false,
    radio_funciona: false,
    aire_funciona: false,
    luces_funcionan: false,
    limpiaparabrisas_funciona: false,
    espejos_completos: false,
    tapizado_buen_estado: false,
    sin_abolladuras: false,
    sin_rayones: false,
  });

  const handleAdmisionChange = (
    field: string,
    value: string | boolean,
  ) => {
    setAdmision({ ...admision, [field]: value });
  };

  const handleChecklistChange = (
    field: string,
    checked: boolean,
  ) => {
    setChecklist({ ...checklist, [field]: checked });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (
        admision.necesita_remolque &&
        !admision.fecha_remolque
      ) {
        setError(
          "Si necesita remolque, debe especificar la fecha",
        );
        setLoading(false);
        return;
      }

      const baseUrl =
        "https://xtpqhsbosazgpwmiifjt.supabase.co/functions/v1/make-server-89b561df";

      // Crear admisión
      const admisionResponse = await fetch(
        `${baseUrl}/admisiones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...admision,
            vehiculo_id: vehiculo.id,
            cliente_id: cliente.id,
            checklist,
            kilometraje_actual:
              parseInt(admision.kilometraje_actual) || 0,
            estimado_dias:
              parseInt(admision.estimado_dias) || 0,
            estimado_costo:
              parseFloat(admision.estimado_costo) || 0,
          }),
        },
      );

      if (!admisionResponse.ok) {
        const errorData = await admisionResponse.json();
        throw new Error(
          errorData.error || "Error al crear admisión",
        );
      }

      const admisionData = await admisionResponse.json();

      setSuccess(
        `✅ Vehículo ingresado correctamente. Orden: ${admisionData.admision.numero_orden}`,
      );

      // Reset y volver después de 3 segundos
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error("Error al crear ingreso:", err);
      setError(err.message || "Error al crear el ingreso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-6" />
              Ingreso de Vehículo al Taller
            </CardTitle>
            <CardDescription>
              Complete la información del ingreso y checklist de
              recepción
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onVolver}>
            <ArrowLeft className="size-4 mr-2" />
            Cambiar Vehículo
          </Button>
        </div>

        {/* Info del cliente y vehículo seleccionados */}
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <User className="size-4 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {cliente.nombre} {cliente.apellido}
                </div>
                <div className="text-xs text-muted-foreground">
                  Tel: {cliente.telefono}
                  {cliente.email &&
                    ` • Email: ${cliente.email}`}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <Car className="size-4 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {vehiculo.marca} {vehiculo.modelo}{" "}
                  {vehiculo.año && `(${vehiculo.año})`}
                </div>
                <div className="text-xs text-muted-foreground">
                  Patente: {vehiculo.patente}
                  {vehiculo.color &&
                    ` • Color: ${vehiculo.color}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="size-5 text-red-600 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800">{success}</div>
          </div>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingreso">
              <FileText className="size-4 mr-2" />
              Datos de Ingreso
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <CheckSquare className="size-4 mr-2" />
              Checklist
            </TabsTrigger>
          </TabsList>

          {/* TAB INGRESO */}
          <TabsContent value="ingreso" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_ingreso">
                  Fecha de Ingreso
                </Label>
                <Input
                  id="fecha_ingreso"
                  type="date"
                  value={admision.fecha_ingreso}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "fecha_ingreso",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="hora_ingreso">
                  Hora de Ingreso
                </Label>
                <Input
                  id="hora_ingreso"
                  type="time"
                  value={admision.hora_ingreso}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "hora_ingreso",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="kilometraje_actual">
                  Kilometraje Actual
                </Label>
                <Input
                  id="kilometraje_actual"
                  type="number"
                  value={admision.kilometraje_actual}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "kilometraje_actual",
                      e.target.value,
                    )
                  }
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="nivel_combustible">
                  Nivel de Combustible
                </Label>
                <Select
                  value={admision.nivel_combustible}
                  onValueChange={(value) =>
                    handleAdmisionChange(
                      "nivel_combustible",
                      value,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacío">Vacío</SelectItem>
                    <SelectItem value="1/4">1/4</SelectItem>
                    <SelectItem value="1/2">1/2</SelectItem>
                    <SelectItem value="3/4">3/4</SelectItem>
                    <SelectItem value="lleno">Lleno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={admision.prioridad}
                  onValueChange={(value) =>
                    handleAdmisionChange("prioridad", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="responsable">
                  Responsable del Trabajo
                </Label>
                <Input
                  id="responsable"
                  value={admision.responsable}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "responsable",
                      e.target.value,
                    )
                  }
                  placeholder="Nombre del mecánico"
                />
              </div>
              <div>
                <Label htmlFor="ubicacion_taller">
                  Ubicación en el Taller
                </Label>
                <Input
                  id="ubicacion_taller"
                  value={admision.ubicacion_taller}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "ubicacion_taller",
                      e.target.value,
                    )
                  }
                  placeholder="Bahía 3"
                />
              </div>
              <div>
                <Label htmlFor="estimado_dias">
                  Días Estimados
                </Label>
                <Input
                  id="estimado_dias"
                  type="number"
                  value={admision.estimado_dias}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "estimado_dias",
                      e.target.value,
                    )
                  }
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="estimado_costo">
                  Costo Estimado ($)
                </Label>
                <Input
                  id="estimado_costo"
                  type="number"
                  value={admision.estimado_costo}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "estimado_costo",
                      e.target.value,
                    )
                  }
                  placeholder="15000"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="motivo_ingreso">
                  Motivo de Ingreso
                </Label>
                <Textarea
                  id="motivo_ingreso"
                  value={admision.motivo_ingreso}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "motivo_ingreso",
                      e.target.value,
                    )
                  }
                  placeholder="Descripción del problema o servicio solicitado"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="diagnostico_inicial">
                  Diagnóstico Inicial
                </Label>
                <Textarea
                  id="diagnostico_inicial"
                  value={admision.diagnostico_inicial}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "diagnostico_inicial",
                      e.target.value,
                    )
                  }
                  placeholder="Primer diagnóstico del mecánico"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="items_personales">
                  Ítems Personales en el Vehículo
                </Label>
                <Textarea
                  id="items_personales"
                  value={admision.items_personales}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "items_personales",
                      e.target.value,
                    )
                  }
                  placeholder="Lista de objetos personales del cliente dentro del vehículo"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="condicion_exterior">
                  Condición Exterior
                </Label>
                <Textarea
                  id="condicion_exterior"
                  value={admision.condicion_exterior}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "condicion_exterior",
                      e.target.value,
                    )
                  }
                  placeholder="Descripción de rayones, abolladuras, daños visibles"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="observaciones">
                  Observaciones Generales
                </Label>
                <Textarea
                  id="observaciones"
                  value={admision.observaciones}
                  onChange={(e) =>
                    handleAdmisionChange(
                      "observaciones",
                      e.target.value,
                    )
                  }
                  placeholder="Otras observaciones importantes"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="necesita_remolque"
                  checked={admision.necesita_remolque}
                  onCheckedChange={(checked) =>
                    handleAdmisionChange(
                      "necesita_remolque",
                      checked as boolean,
                    )
                  }
                />
                <Label htmlFor="necesita_remolque">
                  Necesita Remolque
                </Label>
              </div>
              {admision.necesita_remolque && (
                <div>
                  <Label htmlFor="fecha_remolque">
                    Fecha de Remolque
                  </Label>
                  <Input
                    id="fecha_remolque"
                    type="date"
                    value={admision.fecha_remolque}
                    onChange={(e) =>
                      handleAdmisionChange(
                        "fecha_remolque",
                        e.target.value,
                      )
                    }
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="garantia"
                  checked={admision.garantia}
                  onCheckedChange={(checked) =>
                    handleAdmisionChange(
                      "garantia",
                      checked as boolean,
                    )
                  }
                />
                <Label htmlFor="garantia">
                  Trabajo en Garantía
                </Label>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentTab("checklist")}
              >
                Siguiente: Checklist →
              </Button>
            </div>
          </TabsContent>

          {/* TAB CHECKLIST */}
          <TabsContent value="checklist" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="mb-3">
                  Herramientas y Accesorios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "gato", label: "Gato" },
                    {
                      id: "llave_ruedas",
                      label: "Llave de Ruedas",
                    },
                    {
                      id: "rueda_auxilio",
                      label: "Rueda de Auxilio",
                    },
                    {
                      id: "triangulos",
                      label: "Triángulos de Seguridad",
                    },
                    { id: "matafuego", label: "Matafuego" },
                    { id: "botiquin", label: "Botiquín" },
                    {
                      id: "documentacion",
                      label: "Documentación del Vehículo",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={item.id}
                        checked={
                          checklist[
                            item.id as keyof typeof checklist
                          ]
                        }
                        onCheckedChange={(checked) =>
                          handleChecklistChange(
                            item.id,
                            checked as boolean,
                          )
                        }
                      />
                      <Label htmlFor={item.id}>
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3">Funcionalidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      id: "radio_funciona",
                      label: "Radio Funciona",
                    },
                    {
                      id: "aire_funciona",
                      label: "Aire Acondicionado Funciona",
                    },
                    {
                      id: "luces_funcionan",
                      label: "Luces Funcionan",
                    },
                    {
                      id: "limpiaparabrisas_funciona",
                      label: "Limpiaparabrisas Funciona",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={item.id}
                        checked={
                          checklist[
                            item.id as keyof typeof checklist
                          ]
                        }
                        onCheckedChange={(checked) =>
                          handleChecklistChange(
                            item.id,
                            checked as boolean,
                          )
                        }
                      />
                      <Label htmlFor={item.id}>
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3">Estado Físico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      id: "espejos_completos",
                      label: "Espejos Completos",
                    },
                    {
                      id: "tapizado_buen_estado",
                      label: "Tapizado en Buen Estado",
                    },
                    {
                      id: "sin_abolladuras",
                      label: "Sin Abolladuras",
                    },
                    { id: "sin_rayones", label: "Sin Rayones" },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={item.id}
                        checked={
                          checklist[
                            item.id as keyof typeof checklist
                          ]
                        }
                        onCheckedChange={(checked) =>
                          handleChecklistChange(
                            item.id,
                            checked as boolean,
                          )
                        }
                      />
                      <Label htmlFor={item.id}>
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentTab("ingreso")}
              >
                ← Anterior: Ingreso
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Ingresar Vehículo"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}