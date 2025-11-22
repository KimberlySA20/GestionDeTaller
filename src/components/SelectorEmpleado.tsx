import {
  useState,
  useEffect,
  ReactNode,
  forwardRef,
  HTMLAttributes,
} from "react";

// ====================================================================
// MOCKS Y DEFINICIONES DE UTILIDAD (Para hacer el código ejecutable)
// ====================================================================

// Mocks de Componentes Shadcn/UI (se asume que existen)
const Button = ({
  children,
  onClick,
  disabled,
  className = "",
  ...props
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
} & HTMLAttributes<HTMLButtonElement>) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 font-semibold text-white transition-colors duration-150 rounded-md shadow-md ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} ${className}`}
    {...props}
  >
    {children}
  </button>
);
const Input = forwardRef<
  HTMLInputElement,
  HTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
    {...props}
  />
));
Input.displayName = "Input";

const Label = ({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);
const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white shadow-xl rounded-xl overflow-hidden ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children }: { children: ReactNode }) => (
  <div className="p-6 border-b border-gray-100">{children}</div>
);
const CardContent = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;
const CardDescription = ({
  children,
}: {
  children: ReactNode;
}) => <p className="text-sm text-gray-500 mt-1">{children}</p>;
const CardTitle = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <h2 className={`text-xl font-bold ${className}`}>
    {children}
  </h2>
);
const Tabs = ({
  children,
  value,
  onValueChange,
}: {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}) => <div>{children}</div>;
const TabsList = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex bg-gray-100 p-1 rounded-lg mb-4 ${className}`}
  >
    {children}
  </div>
);
const TabsTrigger = ({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) => (
  <button
    onClick={() => {
      /* Mock: real implementation uses onValueChange from Tabs parent */
    }}
    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${value === "buscar" || value === "crear" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
  >
    {children}
  </button>
);
const TabsContent = ({
  children,
  value,
  className = "",
}: {
  children: ReactNode;
  value: string;
  className?: string;
}) => (
  <div className={className} style={{ display: "block" }}>
    {children}
  </div>
);
const Badge = ({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "default" | "secondary" | "outline";
}) => {
  let colors = "bg-gray-100 text-gray-800";
  if (variant === "default")
    colors = "bg-green-100 text-green-800";
  if (variant === "secondary")
    colors = "bg-yellow-100 text-yellow-800";
  if (variant === "outline")
    colors = "border border-gray-300 text-gray-600";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}
    >
      {children}
    </span>
  );
};
const Select = ({
  children,
  value,
  onValueChange,
}: {
  children: ReactNode;
  value: RolEmpleado | EstadoEmpleado | string;
  onValueChange: (value: any) => void;
}) => {
  const [internalValue, setInternalValue] = useState(value);
  useEffect(() => setInternalValue(value), [value]);

  return (
    <select
      value={internalValue}
      onChange={(e) => {
        setInternalValue(e.target.value as any);
        onValueChange(e.target.value as any);
      }}
      className="w-full p-2 border border-gray-300 rounded-md bg-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
    >
      {children}
    </select>
  );
};
const SelectTrigger = ({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) => <>{children}</>;
const SelectValue = ({
  placeholder,
}: {
  placeholder: string;
}) => <>{placeholder}</>;
const SelectContent = ({
  children,
}: {
  children: ReactNode;
}) => <>{children}</>;
const SelectItem = ({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) => <option value={value}>{children}</option>;

// Mocks de Iconos Lucide-React
const Search = (props: { className?: string }) => (
  <span className={`inline-block ${props.className}`}>🔍</span>
);
const Plus = (props: { className?: string }) => (
  <span className={`inline-block ${props.className}`}>➕</span>
);
const Briefcase = (props: { className?: string }) => (
  <span className={`inline-block ${props.className}`}>💼</span>
);
const Phone = (props: { className?: string }) => (
  <span className={`inline-block ${props.className}`}>📞</span>
);
const Mail = (props: { className?: string }) => (
  <span className={`inline-block ${props.className}`}>📧</span>
);
const AlertCircle = (props: { className?: string }) => (
  <span className={`inline-block ${props.className}`}>⚠️</span>
);

// Mocks de Variables de Entorno/Configuración
const projectId = "xtpqhsbosazgpwmiifjt";
const publicAnonKey = "MOCK_SUPABASE_ANON_KEY";

// ====================================================================
// TIPOS ORIGINALES
// ====================================================================

// Tipos de estado del empleado
export type EstadoEmpleado = "activo" | "inactivo";

// Roles disponibles (extensible)
export type RolEmpleado =
  | "mecanico"
  | "electricista"
  | "chapista"
  | "pintor"
  | "gerente"
  | "administrativo"
  | "recepcionista"
  | "otro";

// Modelo de Empleado con extensibilidad
export interface Empleado {
  id: string;
  // Campos obligatorios
  nombre: string;
  apellido: string;
  rol: RolEmpleado;
  estado: EstadoEmpleado;
  telefono: string; // contacto principal

  // Campos opcionales/adicionales (extensibilidad)
  email?: string;
  telefono_secundario?: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  tipo_documento?: string;
  numero_documento?: string;
  fecha_ingreso?: string;
  salario?: number;
  especialidad?: string;
  notas?: string;

  // Metadatos
  fecha_creacion: string;
  fecha_actualizacion?: string;

  // Campos adicionales personalizados (extensibilidad completa)
  campos_adicionales?: Record<string, any>;
}

interface SelectorEmpleadoProps {
  onEmpleadoSeleccionado: (empleado: Empleado) => void;
  filtrarPorEstado?: EstadoEmpleado;
  filtrarPorRol?: RolEmpleado;
}

// Función de validación
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validarEmpleado(
  empleado: Partial<Empleado>,
): ValidationResult {
  const errors: string[] = [];

  // Validar campos obligatorios
  if (!empleado.nombre || empleado.nombre.trim() === "") {
    errors.push("El nombre es obligatorio");
  }

  if (!empleado.apellido || empleado.apellido.trim() === "") {
    errors.push("El apellido es obligatorio");
  }

  if (!empleado.rol) {
    errors.push("El rol es obligatorio");
  }

  if (!empleado.estado) {
    errors.push("El estado es obligatorio");
  }

  if (!empleado.telefono || empleado.telefono.trim() === "") {
    errors.push("El teléfono de contacto es obligatorio");
  }

  // Validar formatos básicos
  if (empleado.email && empleado.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(empleado.email)) {
      errors.push("El formato del email no es válido");
    }
  }

  if (empleado.telefono && empleado.telefono.trim() !== "") {
    // Validar que tenga al menos números
    const telefonoLimpio = empleado.telefono.replace(
      /[\s\-()]/g,
      "",
    );
    if (telefonoLimpio.length < 8) {
      errors.push("El teléfono debe tener al menos 8 dígitos");
    }
  }

  if (empleado.nombre && empleado.nombre.length > 100) {
    errors.push("El nombre no puede exceder 100 caracteres");
  }

  if (empleado.apellido && empleado.apellido.length > 100) {
    errors.push("El apellido no puede exceder 100 caracteres");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ====================================================================
// COMPONENTE PRINCIPAL CON MEJORA DE ERROR
// ====================================================================

export function SelectorEmpleado({
  onEmpleadoSeleccionado,
  filtrarPorEstado,
  filtrarPorRol,
}: SelectorEmpleadoProps) {
  const [modo, setModo] = useState<"buscar" | "crear">(
    "buscar",
  );
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    string[]
  >([]);

  // Estado para nuevo empleado con valores por defecto
  const [nuevoEmpleado, setNuevoEmpleado] = useState<
    Partial<Empleado>
  >({
    nombre: "Pedro",
    apellido: "González",
    rol: "mecanico",
    estado: "activo",
    telefono: "1111222233",
    email: "pedro@taller.com",
    telefono_secundario: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
    tipo_documento: "DNI",
    numero_documento: "",
    especialidad: "",
    notas: "",
  });

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-89b561df`;

  /**
   * FUNCIÓN CORREGIDA: Incluye un mejor manejo de errores al cargar.
   * Intentará leer el estado HTTP y el cuerpo del error si response.ok es falso.
   */
  const cargarEmpleados = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/empleados`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        // --- INICIO DE LA MEJORA DE GESTIÓN DE ERRORES ---
        let errorBodyMessage =
          "No se pudo obtener el cuerpo del error.";
        try {
          // Intentar leer el cuerpo de la respuesta para obtener un mensaje detallado
          const text = await response.text();
          if (text) {
            try {
              const json = JSON.parse(text);
              // Supabase y Edge Functions a menudo usan el campo 'error'
              errorBodyMessage =
                json.error || JSON.stringify(json);
            } catch (e) {
              // Si no es JSON, usar el texto plano (puede ser HTML de error)
              errorBodyMessage =
                text.substring(0, 200) +
                (text.length > 200 ? "..." : ""); // Limitar a 200 caracteres
            }
          }
        } catch (e) {
          // Fallo al leer el cuerpo de la respuesta
        }

        const status = response.status;
        const statusText =
          response.statusText || "Error de Servidor";

        // Lanzar un error mucho más descriptivo
        throw new Error(
          `[Status ${status}: ${statusText}] ${errorBodyMessage}`,
        );
        // --- FIN DE LA MEJORA DE GESTIÓN DE ERRORES ---
      }

      const data = await response.json();
      setEmpleados(data.empleados || []);
    } catch (err: any) {
      console.error("Error al cargar empleados:", err);
      // Mostrar el mensaje de error detallado que capturamos
      setError(`Error de carga: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modo === "buscar") {
      // Usaré una simulación de carga con datos dummy para que sea ejecutable,
      // pero el código de fetch anterior está en la función cargarEmpleados
      // Simulación de carga (sustituir por la llamada a cargarEmpleados)
      const mockEmpleados: Empleado[] = [
        {
          id: "e1",
          nombre: "Elena",
          apellido: "Rojas",
          rol: "mecanico",
          estado: "activo",
          telefono: "987654321",
          email: "elena@taller.com",
          fecha_creacion: new Date().toISOString(),
        },
        {
          id: "e2",
          nombre: "Martín",
          apellido: "Sosa",
          rol: "electricista",
          estado: "activo",
          telefono: "123456789",
          fecha_creacion: new Date().toISOString(),
        },
        {
          id: "e3",
          nombre: "Ana",
          apellido: "Gómez",
          rol: "administrativo",
          estado: "inactivo",
          telefono: "555111222",
          fecha_creacion: new Date().toISOString(),
        },
      ];

      setLoading(true);
      setError("");

      const timer = setTimeout(() => {
        // Aquí puedes descomentar `cargarEmpleados()` y comentar la simulación si resuelves tu error de API
        // cargarEmpleados();

        // Simulación para ver el componente funcionando:
        setEmpleados(mockEmpleados);
        setLoading(false);
        // Si quieres simular tu error de fetch, descomenta la siguiente línea:
        // setError("Error de carga: [Status 401: Unauthorized] El token de autenticación no es válido.");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [modo]);

  const handleCrearEmpleado = async () => {
    // Validar antes de enviar
    const validation = validarEmpleado(nuevoEmpleado);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setError(
        "Por favor, corrige los errores antes de continuar",
      );
      return;
    }

    setLoading(true);
    setError("");
    setValidationErrors([]);

    try {
      const empleadoAEnviar: Empleado = {
        ...(nuevoEmpleado as Empleado),
        id: crypto.randomUUID(), // Mock ID
        fecha_creacion: new Date().toISOString(),
      };

      // Simulación de la llamada a la API POST
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Aquí iría tu lógica de fetch real:
      // const response = await fetch(`${baseUrl}/empleados`, { ... });

      onEmpleadoSeleccionado(empleadoAEnviar);
    } catch (err: any) {
      console.error("Error al crear empleado:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const empleadosFiltrados = empleados.filter((empleado) => {
    const busqueda = searchTerm.toLowerCase();

    // Aplicar filtros de props
    if (
      filtrarPorEstado &&
      empleado.estado !== filtrarPorEstado
    ) {
      return false;
    }
    if (filtrarPorRol && empleado.rol !== filtrarPorRol) {
      return false;
    }

    // Aplicar búsqueda por texto
    if (searchTerm === "") return true;

    return (
      empleado.nombre.toLowerCase().includes(busqueda) ||
      empleado.apellido.toLowerCase().includes(busqueda) ||
      empleado.telefono.includes(busqueda) ||
      (empleado.email &&
        empleado.email.toLowerCase().includes(busqueda)) ||
      empleado.rol.toLowerCase().includes(busqueda)
    );
  });

  const getRolLabel = (rol: RolEmpleado): string => {
    const labels: Record<RolEmpleado, string> = {
      mecanico: "Mecánico",
      electricista: "Electricista",
      chapista: "Chapista",
      pintor: "Pintor",
      gerente: "Gerente",
      administrativo: "Administrativo",
      recepcionista: "Recepcionista",
      otro: "Otro",
    };
    return labels[rol] || rol;
  };

  const getEstadoBadgeVariant = (estado: EstadoEmpleado) => {
    return estado === "activo" ? "default" : "secondary";
  };

  return (
    <Card className="w-full max-w-lg mx-auto my-8 font-[Inter]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="size-6" />
          Seleccionar o Crear Empleado
        </CardTitle>
        <CardDescription>
          Busca un empleado existente o crea uno nuevo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={modo}
          onValueChange={(value) =>
            setModo(value as "buscar" | "crear")
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

          {/* TAB: BUSCAR EMPLEADO */}
          <TabsContent value="buscar" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, teléfono, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-500">
                Cargando empleados...
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {!loading &&
              !error &&
              empleadosFiltrados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron empleados. Crea uno nuevo
                  usando la pestaña "Crear Nuevo"
                </div>
              )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {empleadosFiltrados.map((empleado) => (
                <Card
                  key={empleado.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
                  onClick={() =>
                    onEmpleadoSeleccionado(empleado)
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {empleado.nombre}{" "}
                            {empleado.apellido}
                          </h3>
                          <Badge
                            variant={getEstadoBadgeVariant(
                              empleado.estado,
                            )}
                          >
                            {empleado.estado
                              .charAt(0)
                              .toUpperCase() +
                              empleado.estado.slice(1)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Briefcase className="size-3" />
                            {getRolLabel(empleado.rol)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {empleado.telefono}
                          </div>
                          {empleado.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="size-3" />
                              {empleado.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        Seleccionar
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB: CREAR EMPLEADO */}
          <TabsContent value="crear" className="space-y-4">
            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">
                      Error al crear empleado:
                    </p>
                    <p className="text-sm">{error}</p>
                    {validationErrors.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm list-disc pl-5">
                        {validationErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CAMPOS OBLIGATORIOS */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-sm text-gray-500">
                  CAMPOS OBLIGATORIOS
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">
                    Nombre{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={nuevoEmpleado.nombre}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        nombre: e.target.value,
                      })
                    }
                    placeholder="Juan"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="apellido">
                    Apellido{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apellido"
                    value={nuevoEmpleado.apellido}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        apellido: e.target.value,
                      })
                    }
                    placeholder="Pérez"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="rol">
                    Rol <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={nuevoEmpleado.rol || ""}
                    onValueChange={(value: RolEmpleado) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        rol: value,
                      })
                    }
                  >
                    <SelectTrigger id="rol">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mecanico">
                        Mecánico
                      </SelectItem>
                      <SelectItem value="electricista">
                        Electricista
                      </SelectItem>
                      <SelectItem value="chapista">
                        Chapista
                      </SelectItem>
                      <SelectItem value="pintor">
                        Pintor
                      </SelectItem>
                      <SelectItem value="gerente">
                        Gerente
                      </SelectItem>
                      <SelectItem value="administrativo">
                        Administrativo
                      </SelectItem>
                      <SelectItem value="recepcionista">
                        Recepcionista
                      </SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estado">
                    Estado{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={nuevoEmpleado.estado || ""}
                    onValueChange={(value: EstadoEmpleado) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        estado: value,
                      })
                    }
                  >
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">
                        Activo
                      </SelectItem>
                      <SelectItem value="inactivo">
                        Inactivo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="telefono">
                    Teléfono (Contacto){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telefono"
                    value={nuevoEmpleado.telefono}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        telefono: e.target.value,
                      })
                    }
                    placeholder="11-1234-5678"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={nuevoEmpleado.email}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        email: e.target.value,
                      })
                    }
                    placeholder="empleado@taller.com"
                  />
                </div>
              </div>
            </div>

            {/* CAMPOS ADICIONALES (Extensibilidad) */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-sm text-gray-500">
                  CAMPOS ADICIONALES (OPCIONALES)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono_secundario">
                    Teléfono Secundario
                  </Label>
                  <Input
                    id="telefono_secundario"
                    value={nuevoEmpleado.telefono_secundario}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        telefono_secundario: e.target.value,
                      })
                    }
                    placeholder="11-8765-4321"
                  />
                </div>

                <div>
                  <Label htmlFor="especialidad">
                    Especialidad
                  </Label>
                  <Input
                    id="especialidad"
                    value={nuevoEmpleado.especialidad}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        especialidad: e.target.value,
                      })
                    }
                    placeholder="Ej: Motor diesel, transmisión automática"
                  />
                </div>

                <div>
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={nuevoEmpleado.ciudad}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        ciudad: e.target.value,
                      })
                    }
                    placeholder="Buenos Aires"
                  />
                </div>

                <div>
                  <Label htmlFor="numero_documento">
                    Número de Documento
                  </Label>
                  <Input
                    id="numero_documento"
                    value={nuevoEmpleado.numero_documento}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        numero_documento: e.target.value,
                      })
                    }
                    placeholder="12345678"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={nuevoEmpleado.direccion}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        direccion: e.target.value,
                      })
                    }
                    placeholder="Av. Corrientes 1234"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Input
                    id="notas"
                    value={nuevoEmpleado.notas}
                    onChange={(e) =>
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        notas: e.target.value,
                      })
                    }
                    placeholder="Información adicional..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleCrearEmpleado}
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

// ====================================================================
// COMPONENTE DE EJEMPLO DE USO (Para que sea runnable)
// ====================================================================

const App = () => {
  const [selectedEmployee, setSelectedEmployee] =
    useState<Empleado | null>(null);

  const handleEmpleadoSeleccionado = (empleado: Empleado) => {
    setSelectedEmployee(empleado);
    console.log("Empleado seleccionado:", empleado);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">
        Demo de Empleados
      </h1>

      <SelectorEmpleado
        onEmpleadoSeleccionado={handleEmpleadoSeleccionado}
      />

      {selectedEmployee && (
        <Card className="mt-8 p-6 max-w-lg mx-auto border-2 border-blue-500">
          <CardTitle>Empleado Seleccionado</CardTitle>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>ID:</strong> {selectedEmployee.id}
            </p>
            <p>
              <strong>Nombre Completo:</strong>{" "}
              {selectedEmployee.nombre}{" "}
              {selectedEmployee.apellido}
            </p>
            <p>
              <strong>Rol:</strong> {selectedEmployee.rol}
            </p>
            <p>
              <strong>Teléfono:</strong>{" "}
              {selectedEmployee.telefono}
            </p>
            {selectedEmployee.email && (
              <p>
                <strong>Email:</strong> {selectedEmployee.email}
              </p>
            )}
          </div>
          <Button
            onClick={() => setSelectedEmployee(null)}
            className="mt-4 bg-red-500 hover:bg-red-600"
          >
            Limpiar Selección
          </Button>
        </Card>
      )}

      <div className="mt-12 p-4 max-w-lg mx-auto bg-gray-100 rounded-lg">
        <h3 className="font-bold text-lg text-red-700">
          Nota Importante sobre el Error:
        </h3>
        <p className="text-sm mt-2">
          La corrección clave se encuentra en la función
          <code className="bg-gray-200 p-1 rounded">
            cargarEmpleados
          </code>
          . Ahora, si la solicitud falla (
          <code className="bg-gray-200 p-1 rounded">
            response.ok
          </code>{" "}
          es falso), el código intenta extraer el{" "}
          <span className="font-semibold">
            código de estado HTTP
          </span>
          (ej. 401, 403, 500) y el{" "}
          <span className="font-semibold">
            cuerpo de la respuesta del servidor
          </span>
          .
        </p>
        <p className="text-sm mt-2">
          Cuando ejecutes tu código con tu API real y falle,{" "}
          <strong className="text-red-700">
            el error que aparecerá en pantalla
          </strong>{" "}
          te dará la pista exacta (ej:{" "}
          <code className="bg-gray-200 p-1 rounded">
            Error de carga: [Status 401: Unauthorized]
          </code>
          ).
        </p>
      </div>
    </div>
  );
};

export default App;