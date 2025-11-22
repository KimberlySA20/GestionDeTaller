import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
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
  telefono_secundario: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  tipo_documento: string;
  numero_documento: string;
  notas: string;
  fecha_creacion: string;
}

interface SelectorClienteProps {
  onClienteSeleccionado: (cliente: Cliente) => void;
}

export function SelectorCliente({
  onClienteSeleccionado,
}: SelectorClienteProps) {
  const [modo, setModo] = useState<"buscar" | "crear">(
    "buscar",
  );
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    telefono_secundario: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
    tipo_documento: "DNI",
    numero_documento: "",
    notas: "",
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (modo === "buscar") {
      cargarClientes();
    }
  }, [modo]);

  const cargarClientes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/clientes`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok)
        throw new Error("Error al cargar clientes");
      const data = await response.json();
      setClientes(data.clientes);
    } catch (err: any) {
      console.error("Error al cargar clientes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const debugKV = async () => {
    try {
      const res = await fetch(`${baseUrl}/debug-kv`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await res.json();
      console.log("DEBUG KV:", data);
      alert("Revisa la consola para ver el contenido del KV");
    } catch (err) {
      console.error("Error debug KV:", err);
      alert("Error debug KV: " + err);
    }
  };

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.telefono) {
      setError("Nombre y teléfono son obligatorios");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(nuevoCliente),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al crear cliente",
        );
      }

      const data = await response.json();
      onClienteSeleccionado(data.cliente);
    } catch (err: any) {
      console.error("Error al crear cliente:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const busqueda = searchTerm.toLowerCase();
    console.log("busqueda");
    return (
      cliente.nombre.toLowerCase().includes(busqueda) ||
      cliente.apellido.toLowerCase().includes(busqueda) ||
      cliente.telefono.includes(busqueda) ||
      cliente.email.toLowerCase().includes(busqueda)
    );
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-6" />
          Seleccionar o Crear Cliente
        </CardTitle>
        <CardDescription>
          Busca un cliente existente o crea uno nuevo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={modo}
          onValueChange={(value : "buscar" | "crear") =>
            setModo(value)
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buscar">
              <Search className="size-4 mr-2" />
              Buscar Existente
            </TabsTrigger>
            <TabsTrigger value="crear">
              <Plus className="size-4 mr-2" />
              Crear Nuevo
            </TabsTrigger>
          </TabsList>

          {/* TAB: BUSCAR CLIENTE */}
          <TabsContent value="buscar" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading && (
              <div className="text-center py-8 text-muted-foreground">
                Cargando clientes...
              </div>
            )}

            {error && (
              <div className="text-center py-4 text-red-600">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              clientesFiltrados.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron clientes. Crea uno nuevo
                  usando la pestaña "Crear Nuevo"
                </div>
              )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {clientesFiltrados.map((cliente) => (
                <Card
                  key={cliente.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onClienteSeleccionado(cliente)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {cliente.nombre} {cliente.apellido}
                          </h3>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {cliente.telefono}
                          </div>
                          {cliente.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="size-3" />
                              {cliente.email}
                            </div>
                          )}
                          {cliente.ciudad && (
                            <div className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {cliente.ciudad}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        Click para seleccionar
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB: CREAR CLIENTE */}
          <TabsContent value="crear" className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={nuevoCliente.nombre}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Juan"
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={nuevoCliente.apellido}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      apellido: e.target.value,
                    })
                  }
                  placeholder="Pérez"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={nuevoCliente.telefono}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      telefono: e.target.value,
                    })
                  }
                  placeholder="11-1234-5678"
                />
              </div>
              <div>
                <Label htmlFor="telefono_secundario">
                  Teléfono Secundario
                </Label>
                <Input
                  id="telefono_secundario"
                  value={nuevoCliente.telefono_secundario}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      telefono_secundario: e.target.value,
                    })
                  }
                  placeholder="11-8765-4321"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={nuevoCliente.email}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      email: e.target.value,
                    })
                  }
                  placeholder="juan.perez@email.com"
                />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={nuevoCliente.ciudad}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      ciudad: e.target.value,
                    })
                  }
                  placeholder="Buenos Aires"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={nuevoCliente.direccion}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      direccion: e.target.value,
                    })
                  }
                  placeholder="Av. Corrientes 1234"
                />
              </div>
              <div>
                <Label htmlFor="codigo_postal">
                  Código Postal
                </Label>
                <Input
                  id="codigo_postal"
                  value={nuevoCliente.codigo_postal}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      codigo_postal: e.target.value,
                    })
                  }
                  placeholder="C1043"
                />
              </div>
              <div>
                <Label htmlFor="numero_documento">
                  Número de Documento
                </Label>
                <Input
                  id="numero_documento"
                  value={nuevoCliente.numero_documento}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      numero_documento: e.target.value,
                    })
                  }
                  placeholder="12345678"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleCrearCliente}
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear y Continuar"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}