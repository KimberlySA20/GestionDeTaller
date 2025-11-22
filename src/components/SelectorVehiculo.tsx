import { useState, useEffect } from "react";
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
  Search,
  Plus,
  Car,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";


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
  telefono: string;
}

interface SelectorVehiculoProps {
  cliente: Cliente;
  onVehiculoSeleccionado: (vehiculo: Vehiculo) => void;
  onVolver: () => void;
}

export function SelectorVehiculo({
  cliente,
  onVehiculoSeleccionado,
  onVolver,
}: SelectorVehiculoProps) {
  const [modo, setModo] = useState<"buscar" | "crear">(
    "buscar",
  );
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado para nuevo vehículo
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    marca: "",
    modelo: "",
    año: "",
    patente: "",
    vin: "",
    color: "",
    tipo_vehiculo: "automóvil",
    tipo_combustible: "nafta",
    transmision: "manual",
    kilometraje: "",
    numero_motor: "",
    numero_chasis: "",
    cilindrada: "",
    categoria: "",
    poliza_seguro: "",
    compañia_seguro: "",
    vencimiento_seguro: "",
    notas: "",
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (modo === "buscar") {
      cargarVehiculos();
    }
  }, [modo]);

  const cargarVehiculos = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${baseUrl}/clientes/${cliente.id}/vehiculos`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );
      if (!response.ok)
        throw new Error("Error al cargar vehículos");
      const data = await response.json();
      setVehiculos(data.vehiculos);
    } catch (err: any) {
      console.error("Error al cargar vehículos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearVehiculo = async () => {
    if (
      !nuevoVehiculo.marca ||
      !nuevoVehiculo.modelo ||
      !nuevoVehiculo.patente
    ) {
      setError("Marca, modelo y patente son obligatorios");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/vehiculos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ...nuevoVehiculo,
          cliente_id: cliente.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al crear vehículo",
        );
      }

      const data = await response.json();
      onVehiculoSeleccionado(data.vehiculo);
    } catch (err: any) {
      console.error("Error al crear vehículo:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="size-6" />
              Seleccionar o Registrar Vehículo
            </CardTitle>
            <CardDescription>
              Cliente: {cliente.nombre} {cliente.apellido}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onVolver}>
            <ArrowLeft className="size-4 mr-2" />
            Cambiar Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={modo}
          onValueChange={(value: "buscar" | "crear") =>
            setModo(value)
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buscar">
              <Search className="size-4 mr-2" />
              Vehículos del Cliente
            </TabsTrigger>
            <TabsTrigger value="crear">
              <Plus className="size-4 mr-2" />
              Registrar Nuevo
            </TabsTrigger>
          </TabsList>

          {/* TAB: VEHÍCULOS EXISTENTES */}
          <TabsContent value="buscar" className="space-y-4">
            {loading && (
              <div className="text-center py-8 text-muted-foreground">
                Cargando vehículos...
              </div>
            )}

            {error && (
              <div className="text-center py-4 text-red-600">
                {error}
              </div>
            )}

            {!loading && !error && vehiculos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="size-12 mx-auto mb-3 opacity-50" />
                <p>
                  Este cliente no tiene vehículos registrados
                </p>
                <p className="text-sm mt-1">
                  Usa la pestaña "Registrar Nuevo" para agregar
                  uno
                </p>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vehiculos.map((vehiculo) => (
                <Card
                  key={vehiculo.id}
                  className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary"
                  onClick={() =>
                    onVehiculoSeleccionado(vehiculo)
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {vehiculo.marca} {vehiculo.modelo}
                          </h3>
                          {vehiculo.año && (
                            <Badge variant="outline">
                              {vehiculo.año}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">
                              Patente:
                            </span>{" "}
                            {vehiculo.patente}
                          </div>
                          {vehiculo.color && (
                            <div>
                              <span className="font-medium">
                                Color:
                              </span>{" "}
                              {vehiculo.color}
                            </div>
                          )}
                          {vehiculo.tipo_combustible && (
                            <div>
                              <span className="font-medium">
                                Combustible:
                              </span>{" "}
                              {vehiculo.tipo_combustible}
                            </div>
                          )}
                          {vehiculo.kilometraje > 0 && (
                            <div>
                              <span className="font-medium">
                                Km:
                              </span>{" "}
                              {vehiculo.kilometraje.toLocaleString()}
                            </div>
                          )}
                        </div>
                        {vehiculo.notas && (
                          <div className="mt-2 text-sm text-muted-foreground italic">
                            {vehiculo.notas}
                          </div>
                        )}
                      </div>
                      <Badge>Click para seleccionar</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB: CREAR VEHÍCULO */}
          <TabsContent value="crear" className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  value={nuevoVehiculo.marca}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      marca: e.target.value,
                    })
                  }
                  placeholder="Toyota"
                />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  value={nuevoVehiculo.modelo}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      modelo: e.target.value,
                    })
                  }
                  placeholder="Corolla"
                />
              </div>
              <div>
                <Label htmlFor="año">Año</Label>
                <Input
                  id="año"
                  value={nuevoVehiculo.año}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      año: e.target.value,
                    })
                  }
                  placeholder="2020"
                />
              </div>
              <div>
                <Label htmlFor="patente">Patente *</Label>
                <Input
                  id="patente"
                  value={nuevoVehiculo.patente}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      patente: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABC123"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={nuevoVehiculo.color}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      color: e.target.value,
                    })
                  }
                  placeholder="Blanco"
                />
              </div>
              <div>
                <Label htmlFor="tipo_vehiculo">
                  Tipo de Vehículo
                </Label>
                <Select
                  value={nuevoVehiculo.tipo_vehiculo}
                  onValueChange={(value : any) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      tipo_vehiculo: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automóvil">
                      Automóvil
                    </SelectItem>
                    <SelectItem value="camioneta">
                      Camioneta
                    </SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="camión">
                      Camión
                    </SelectItem>
                    <SelectItem value="utilitario">
                      Utilitario
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo_combustible">
                  Combustible
                </Label>
                <Select
                  value={nuevoVehiculo.tipo_combustible}
                  onValueChange={(value : any) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      tipo_combustible: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nafta">Nafta</SelectItem>
                    <SelectItem value="diesel">
                      Diesel
                    </SelectItem>
                    <SelectItem value="gnc">GNC</SelectItem>
                    <SelectItem value="híbrido">
                      Híbrido
                    </SelectItem>
                    <SelectItem value="eléctrico">
                      Eléctrico
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transmision">Transmisión</Label>
                <Select
                  value={nuevoVehiculo.transmision}
                  onValueChange={(value : any) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      transmision: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">
                      Manual
                    </SelectItem>
                    <SelectItem value="automática">
                      Automática
                    </SelectItem>
                    <SelectItem value="semi-automática">
                      Semi-automática
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="kilometraje">Kilometraje</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  value={nuevoVehiculo.kilometraje}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      kilometraje: e.target.value,
                    })
                  }
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="vin">VIN/Chasis</Label>
                <Input
                  id="vin"
                  value={nuevoVehiculo.vin}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      vin: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="1HGBH41JXMN109186"
                />
              </div>
              <div>
                <Label htmlFor="numero_motor">
                  Número de Motor
                </Label>
                <Input
                  id="numero_motor"
                  value={nuevoVehiculo.numero_motor}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      numero_motor: e.target.value,
                    })
                  }
                  placeholder="ABC123456"
                />
              </div>
              <div>
                <Label htmlFor="cilindrada">Cilindrada</Label>
                <Input
                  id="cilindrada"
                  value={nuevoVehiculo.cilindrada}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      cilindrada: e.target.value,
                    })
                  }
                  placeholder="1.6L"
                />
              </div>
              <div>
                <Label htmlFor="compañia_seguro">
                  Compañía de Seguro
                </Label>
                <Input
                  id="compañia_seguro"
                  value={nuevoVehiculo.compañia_seguro}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      compañia_seguro: e.target.value,
                    })
                  }
                  placeholder="Seguros XYZ"
                />
              </div>
              <div>
                <Label htmlFor="poliza_seguro">
                  Número de Póliza
                </Label>
                <Input
                  id="poliza_seguro"
                  value={nuevoVehiculo.poliza_seguro}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      poliza_seguro: e.target.value,
                    })
                  }
                  placeholder="123456789"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notas_vehiculo">
                  Notas del Vehículo
                </Label>
                <Textarea
                  id="notas_vehiculo"
                  value={nuevoVehiculo.notas}
                  onChange={(e) =>
                    setNuevoVehiculo({
                      ...nuevoVehiculo,
                      notas: e.target.value,
                    })
                  }
                  placeholder="Información adicional sobre el vehículo"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleCrearVehiculo}
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : "Registrar y Continuar"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}