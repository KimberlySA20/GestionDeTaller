import { useState, useEffect } from "react";
import { FormularioVehiculo } from "./components/FormularioVehiculo";
import { ListaVehiculos } from "./components/ListaVehiculos";
import { Estadisticas } from "./components/Estadisticas";
import { GestionAdmisiones } from "./components/GestionAdmisiones";
import { PaginaEmpleados } from "./components/PaginaEmpleados";
import { SelectorRol } from "./components/SelectorRol";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import {
  Car,
  ListChecks,
  BarChart3,
  ClipboardCheck,
  Activity,
  Users,
  LogOut,
} from "lucide-react";
import { Button } from "./components/ui/button";

function AppContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { usuario, logout, puedeAcceder } = useAuth();

  const handleSuccess = () => {
    // Incrementar key para forzar refresh de listas
    setRefreshKey((prev) => prev + 1);
  };

  const [mostrarSelectorRol, setMostrarSelectorRol] =
    useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="flex items-center gap-3 mb-2">
                <Car className="size-10 text-primary" />
                Sistema de Gestión de Taller Mecánico
              </h1>
              <p className="text-muted-foreground">
                Administración completa de ingresos, vehículos y
                trabajos
              </p>
            </div>

            {/* Info usuario */}
            <div className="text-right">
              <Button
                onClick={() => setMostrarSelectorRol((v) => !v)}
              >
                Selecionar Rol
              </Button>
              <p className="text-sm text-gray-600">
                Sesión iniciada como:
              </p>
              <p className="mb-2">
                <strong>{usuario?.nombre}</strong>
              </p>
              <p className="text-xs text-gray-500 mb-2">
                Rol: {usuario?.rol}
              </p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="ingreso" className="w-full">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-5 mb-6">
            <TabsTrigger
              value="ingreso"
              className="flex items-center gap-2"
              disabled={!puedeAcceder("admisiones")}
            >
              <Car className="size-4" />
              Ingreso
            </TabsTrigger>
            <TabsTrigger
              value="admisiones"
              className="flex items-center gap-2"
              disabled={!puedeAcceder("admisiones")}
            >
              <ClipboardCheck className="size-4" />
              Admisiones
            </TabsTrigger>
            <TabsTrigger
              value="vehiculos"
              className="flex items-center gap-2"
              disabled={!puedeAcceder("vehiculos")}
            >
              <ListChecks className="size-4" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger
              value="empleados"
              className="flex items-center gap-2"
              disabled={!puedeAcceder("empleados")}
            >
              <Users className="size-4" />
              Empleados
            </TabsTrigger>
            <TabsTrigger
              value="estadisticas"
              className="flex items-center gap-2"
              disabled={!puedeAcceder("estadisticas")}
            >
              <BarChart3 className="size-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingreso">
            <FormularioVehiculo onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="admisiones">
            <GestionAdmisiones refresh={refreshKey} />
          </TabsContent>

          <TabsContent value="vehiculos">
            <ListaVehiculos refresh={refreshKey} />
          </TabsContent>

          <TabsContent value="empleados">
            <PaginaEmpleados />
          </TabsContent>

          <TabsContent value="estadisticas">
            <Estadisticas refresh={refreshKey} />
            <div className="mt-6">
              <ListaVehiculos refresh={refreshKey} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Selector de rol para desarrollo */}
      
      {mostrarSelectorRol && (
        <SelectorRol
          onClose={() => setMostrarSelectorRol(false)}
        />
      )}

      {/* Toaster para notificaciones */}
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}