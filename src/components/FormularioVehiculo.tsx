import { useState } from "react";
import { SelectorCliente } from "./SelectorCliente";
import { SelectorVehiculo } from "./SelectorVehiculo";
import { FormularioAdmision } from "./FormularioAdmision";

interface FormularioVehiculoProps {
  onSuccess?: () => void;
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

export function FormularioVehiculo({ onSuccess }: FormularioVehiculoProps) {
  const [paso, setPaso] = useState<"cliente" | "vehiculo" | "admision">("cliente");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);

  const handleClienteSeleccionado = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setPaso("vehiculo");
  };

  const handleVehiculoSeleccionado = (vehiculo: Vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setPaso("admision");
  };

  const handleVolverCliente = () => {
    setClienteSeleccionado(null);
    setVehiculoSeleccionado(null);
    setPaso("cliente");
  };

  const handleVolverVehiculo = () => {
    setVehiculoSeleccionado(null);
    setPaso("vehiculo");
  };

  const handleSuccess = () => {
    // Reset completo
    setClienteSeleccionado(null);
    setVehiculoSeleccionado(null);
    setPaso("cliente");
    if (onSuccess) onSuccess();
  };

  // Paso 1: Seleccionar o crear cliente
  if (paso === "cliente") {
    return <SelectorCliente onClienteSeleccionado={handleClienteSeleccionado} />;
  }

  // Paso 2: Seleccionar o crear vehículo
  if (paso === "vehiculo" && clienteSeleccionado) {
    return (
      <SelectorVehiculo
        cliente={clienteSeleccionado}
        onVehiculoSeleccionado={handleVehiculoSeleccionado}
        onVolver={handleVolverCliente}
      />
    );
  }

  // Paso 3: Crear admisión con checklist
  if (paso === "admision" && clienteSeleccionado && vehiculoSeleccionado) {
    return (
      <FormularioAdmision
        cliente={clienteSeleccionado}
        vehiculo={vehiculoSeleccionado}
        onVolver={handleVolverVehiculo}
        onSuccess={handleSuccess}
      />
    );
  }

  return null;
}
